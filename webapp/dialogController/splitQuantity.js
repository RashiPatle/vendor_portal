/*eslint linebreak-style: ["error", "windows"]*/
jQuery.sap.declare("ui.tm.vps.ztmvpsintutive.dialogController.splitQuantity");

ui.tm.vps.ztmvpsintutive.dialogController.splitQuantity = {
    _oDialogNameSpace: "ui.tm.vps.ztmvpsintutive",
    _oDialogThis: undefined,
    _oDialogFragmentId: "",
    _oCompController: null,
    _oThisFOContext: null,
    _oSelectedFO: null,

    openSplitQtyDialog: function (oThis, sParent, context, sTitle) {
        this._oDialogThis = oThis;
        this._oThisFOContext = context;
        this._oDialogFragmentId = "idDialogSplitQty" + oThis.getView().getId();
        this._oCompController = this._oDialogThis.getOwnerComponent();
        var sPath = context.sPath;
        var oBindingContext = context.getObject();
        var oModel = this._oDialogThis.getView().getModel();
        this._oDialogThis.getView().getModel().setDefaultBindingMode("TwoWay");

        // RSR - PO Details Model to store all requried data //
        this._oPOModel = this._oDialogThis.getOwnerComponent().getModel("oPOModel");

        if (!this._oSplitQtyDialog) {
            this._oSplitQtyDialog = sap.ui.xmlfragment(this._oDialogFragmentId,
                this._oDialogNameSpace + ".fragment.Dialog.splitQuantity",
                this
            );
            this._oDialogThis.getView().addDependent(this._oSplitQtyDialog);
        }

        sap.ui.getCore().byId(this._oDialogFragmentId + "--idDialogSplitQty").setModel(oModel);
        sap.ui.getCore().byId(this._oDialogFragmentId + "--idDialogSplitQty").setTitle(sTitle);
        sap.ui.getCore().byId(this._oDialogFragmentId + "--idDialogSplitQty").bindElement(sPath);

        //set the current FO
        this._oSelectedFO = oBindingContext.PurchaseOrder;
        this._oSplitQtyDialog.open();
    },
    onSplitQtyCancelClick: function () {
        this._oSplitQtyDialog.close();
        this._oSplitQtyDialog.destroy();
        this._oSplitQtyDialog = null;
        this._oThisFOContext = null;
    },

    onLiveChangeSplitQty: function (oEvent) {
        sSplitValue = parseInt(oEvent.getParameter("value"));
        sQuantity = parseInt(this._oThisFOContext.getObject().ItemQuantity);
        switch (true) {
            case (sSplitValue >= sQuantity):
                sap.ui.getCore().byId(this._oDialogFragmentId + "--splitQtyId").setValueState("Error");
                sap.ui.getCore().byId(this._oDialogFragmentId + "--splitQtyId").setValueStateText("Split Quantity should not be equal to and greater then Actaul Quantity");
                sap.ui.getCore().byId(this._oDialogFragmentId + "--idButtonAccept").setEnabled(false);
                break;
            case (sSplitValue <= 0):
                sap.ui.getCore().byId(this._oDialogFragmentId + "--splitQtyId").setValueState("Error");
                sap.ui.getCore().byId(this._oDialogFragmentId + "--splitQtyId").setValueStateText("Invalid Quantity Entered");
                sap.ui.getCore().byId(this._oDialogFragmentId + "--idButtonAccept").setEnabled(false);
                break;
            case (oEvent.getParameter("value") === ""):
                sap.ui.getCore().byId(this._oDialogFragmentId + "--splitQtyId").setValueState("None");
                sap.ui.getCore().byId(this._oDialogFragmentId + "--splitQtyId").setValueStateText("");
                sap.ui.getCore().byId(this._oDialogFragmentId + "--idButtonAccept").setEnabled(false);
                break;
            case (sQuantity > sSplitValue):
                sap.ui.getCore().byId(this._oDialogFragmentId + "--splitQtyId").setValueState("None");
                sap.ui.getCore().byId(this._oDialogFragmentId + "--splitQtyId").setValueStateText("");
                sap.ui.getCore().byId(this._oDialogFragmentId + "--idButtonAccept").setEnabled(true);
                break;
        }
    },
    onSplitQtyAcceptClick: function () {
        var oDataModel = this._oDialogThis.getView().getModel();
        var sFO = this._oThisFOContext.getObject().TransportationOrderItemUUID;
        var sFUID = this._oThisFOContext.getObject().FreightUnitUUID;
        var events = {
            "ItemQuantity": this.restrictEditDecimal(sap.ui.getCore().byId(this._oDialogFragmentId + "--splitQtyId").getValue()),
            "TransportationOrderItemUUID": sFO
        }
        oDataModel.callFunction("/SplitItem", {    // function import name
            method: "POST",                             // http method
            urlParameters: events, // function import parameters        
            success: function (oData, response) {
                oDataModel.read("/ZTM_C_VendorFreightUnits", {
                    success: function (oData) {

                    },
                    error: function (oError) {

                    }
                });
                var sMessageValue = oData.SplitItem.Success;
                if (sMessageValue === true) {
                    var sMsg = oData.SplitItem.Message;
                    var sSuccess = "Success";
                    sap.m.MessageBox.show(
                        sMsg, {
                        icon: sap.m.MessageBox.Icon.SUCCESS,
                        title: sSuccess,
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                } else {
                    var sMsg = oData.SplitItem.Message;
                    var sSuccess = "Error";
                    sap.m.MessageBox.show(
                        sMsg, {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: sSuccess,
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                }
            },      // callback function for success
            error: function (oError) {
                sap.m.MessageBox.error("Error request failed");
            }.bind(this)                  // callback function for error
        });
        this.onSplitQtyCancelClick();
    },
    restrictEditDecimal: function (iNumber) {
        return parseFloat(iNumber).toFixed(3);
    },
    onSearchUnitOfMeasure: function (oEvent) {
        var sInputValue = oEvent.getSource().getValue();
        this.inputId = oEvent.getSource().getId();

        // create value help dialog
        if (!this.oDialogUnitOfMeasure) {
            this.oDialogUnitOfMeasure = sap.ui.xmlfragment(this._oDialogFragmentId,
                this._oDialogNameSpace + ".fragment.unitOfMeasure",
                this
            );
            this._oDialogThis.getView().addDependent(this.oDialogUnitOfMeasure);
        }
        this.oDialogUnitOfMeasure.getBinding("items").filter([new sap.ui.model.Filter(
            "UnitOfMeasure",
            sap.ui.model.FilterOperator.Contains, sInputValue
        )]);
        this.oDialogUnitOfMeasure.open(sInputValue);
    },
    handleTableValueHelpCancel: function (oEvent) {
        oEvent.getSource().getBinding("items").filter([]);
    },
    _handleUnitOfMeasureSearch: function (evt) {
        evt.getSource().getBinding("items").filter([]);
        var sValue = evt.getParameter("value");
        var oFilter = new sap.ui.model.Filter(
            "UnitOfMeasure",
            sap.ui.model.FilterOperator.Contains, sValue
        );
        evt.getSource().getBinding("items").filter([oFilter]);
    },
    onUnitOfMeasuresConfirm: function (oEvent) {
        var selectedUnitOfMeasure = oEvent.getParameter("selectedItem");

        if (selectedUnitOfMeasure) {
            sap.ui.getCore().byId(this.inputId).setValue(selectedUnitOfMeasure.getBindingContext().getObject().UnitOfMeasure);
        }
        oEvent.getSource().getBinding("items").filter([]);
    }

};