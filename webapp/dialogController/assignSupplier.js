/*eslint linebreak-style: ["error", "windows"]*/
jQuery.sap.declare("ui.tm.vps.ztmvpsintutive.dialogController.assignSupplier");

ui.tm.vps.ztmvpsintutive.dialogController.assignSupplier = {
    _oDialogNameSpace: "ui.tm.vps.ztmvpsintutive",
    _oDialogThis: undefined,
    _oDialogFragmentId: "",
    _oCompController: null,
    _oThisFOContext: null,
    _oSelectedFO: null,

    openSupplierDialog: function (oThis, sParent, context, sTitle) {
        this._oDialogThis = oThis;
        this._oThisFOContext = context;
        this._oDialogFragmentId = "idDialogAssignPODetails" + oThis.getView().getId();
        this._oCompController = this._oDialogThis.getOwnerComponent();
        var sPath = context.sPath;
        var oBindingContext = context.getObject();
        var oModel = this._oDialogThis.getView().getModel();
        this._oDialogThis.getView().getModel().setDefaultBindingMode("TwoWay");

        // RSR - PO Details Model to store all requried data //
        this._oPOModel = this._oDialogThis.getOwnerComponent().getModel("oPOModel");

        if (!this._oAssignmentDialog) {
            this._oAssignmentDialog = sap.ui.xmlfragment(this._oDialogFragmentId,
                this._oDialogNameSpace + ".fragment.Dialog.assignSupplierDetails",
                this
            );
            this._oDialogThis.getView().addDependent(this._oAssignmentDialog);
        }

        sap.ui.getCore().byId(this._oDialogFragmentId + "--idDialogAssignPODetails").setModel(oModel);
        sap.ui.getCore().byId(this._oDialogFragmentId + "--idDialogAssignPODetails").setTitle(sTitle);
        sap.ui.getCore().byId(this._oDialogFragmentId + "--idDialogAssignPODetails").bindElement(sPath);

        //set the current FO
        this._oSelectedFO = oBindingContext.PurchaseOrder;
        this._oAssignmentDialog.open();
    },
    onAssignDialogAcceptClick: function (oEvent) {
        var oUpdateModel = this._oDialogThis.getView().getModel();

        var sFO = this._oThisFOContext.getObject().TransportationOrderItemUUID;
        var sFUID = this._oThisFOContext.getObject().FreightUnitUUID;
        var events = {
            "TransportationOrderItemUUID": sFO,
            "FreightUnitUUID": sFUID,
            "ItemPackagingMaterialCategory": this._oThisFOContext.getObject().ItemPackagingMaterialCategory,
            "ItemPackagingMaterialType": this._oThisFOContext.getObject().ItemPackagingMaterialType,
            "ItemPackageQty": this._oThisFOContext.getObject().ItemPackageQty,
            // "ItemPackageQtyUni": oFreightOrder.ItemPackageQtyUni,
            "ItemLength": this._oThisFOContext.getObject().ItemLength,
            "ItemWidth": this._oThisFOContext.getObject().ItemWidth,
            "ItemHeight": this._oThisFOContext.getObject().ItemHeight,
            "ItemLengthUnit": this._oThisFOContext.getObject().ItemLengthUnit,
            "ItemWeight": this._oThisFOContext.getObject().ItemWeight,
            "ItemWeightUnit": this._oThisFOContext.getObject().ItemWeightUnit,
            // "ItemVolume": oFreightOrder.ItemVolume,
            // "ItemVolumeUnit": oFreightOrder.ItemVolumeUnit,
            "PickupDate": this._oThisFOContext.getObject().PickupDate,
            "ItemPickupLocation": this._oThisFOContext.getObject().ItemPickupLocation,
            "MonetaryValue": this._oThisFOContext.getObject().MonetaryValue,
            "MonetaryValueCrcy": this._oThisFOContext.getObject().MonetaryValueCrcy,
            "ItemTrackingNumber": this._oThisFOContext.getObject().ItemTrackingNumber,
            "DangerousGoodsIndicator": this._oThisFOContext.getObject().DangerousGoodsIndicator,
            "SpecialInstructions": sap.ui.getCore().byId(this._oDialogFragmentId + "--spslInstId").getValue(),
            "SupplierName": sap.ui.getCore().byId(this._oDialogFragmentId + "--inputName").getValue(),
            "SupplierNumber": sap.ui.getCore().byId(this._oDialogFragmentId + "--inputPhoneNum").getValue(),
            "SupplierContact": sap.ui.getCore().byId(this._oDialogFragmentId + "--inputEmail").getValue(),

        };
        var path = sap.ui.getCore().byId(this._oDialogFragmentId + "--idDialogAssignPODetails").getObjectBinding().getPath();
        oUpdateModel.update(path, events, {
            success: function (oData, response) {
                var sMsg = "Record Updated";
                var sSuccess = "Success";
                sap.m.MessageBox.show(
                    sMsg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: sSuccess,
                    actions: [sap.m.MessageBox.Action.OK]
                });
            },
            error: function (oError) {
                sap.m.MessageBox.error("Error request failed");
            }.bind(this)
        });
        //close Assignment popup when success!
        this.onAssignDialogCancelClick();
    },
    onAssignDialogCancelClick: function () {
        this._oAssignmentDialog.close();
        this._oAssignmentDialog.destroy();
        this._oAssignmentDialog = null;
        this._oThisFOContext = null;
    }
};