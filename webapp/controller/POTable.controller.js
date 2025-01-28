sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "ui/tm/vps/ztmvpsintutive/util/BaseController",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, BaseController, Filter, MessageBox, MessageToast, Dialog, Button, FilterOperator) {
        "use strict";
        var oTable;
        return BaseController.extend("ui.tm.vps.ztmvpsintutive.controller.POTable", {
            onInit: function () {
                this._oCustomSelect = this.byId("customSelect");
                // RSR - PO Details Model to store all requried data //
                this._oPOModel = this.getOwnerComponent().getModel("oPOModel");
                //RSR - Setting up default delivery date
                var cDate = new Date();
                this.oDefaultDate = new Date(cDate.setDate(cDate.getDate() - 5));
                //RSR - Get the Timezone to set on the Table Header
                var lTimeZone = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
                // this._oPOModel.setProperty("/nLabPickUpDate", lTimeZone)
                //
            },

            _getInitialPOTable: function () {
                var myModel = this.getOwnerComponent().getModel();
                sap.ui.getCore().setModel(myModel);
                var readurl = "/ZTM_C_VendorFreightUnits";
                myModel.read(readurl, {
                    success: function (oData, oResponse) {

                    }
                });
            },
            onPressContinue: function (oEvent) {
                var i;
                var that = this;
                var cValidErr = false;
                this._oPOModel.setProperty("/cValidData", cValidErr);
                this._oPOModel.setProperty("/cWeightValid", true);
                var gettingInternalTable = this.byId("LineItemsSmartTable").getTable();
                var gettingAllRows = gettingInternalTable.getBinding().aKeys;
                var oSelIndices = gettingInternalTable.getSelectedIndices();
                if (oSelIndices.length === 0) {
                    MessageBox.error("Please Select the Rows");
                } else {
                    for (i = 0; i < oSelIndices.length; i++) {
                        var aFreightOrder = this.getView().getModel().getObject("/" + gettingAllRows[oSelIndices[i]]);
                        if (aFreightOrder.FreightUnitEditFlag === false) {
                            return;
                        }
                        this._ValidationMandatoryFields(aFreightOrder, cValidErr);
                    }
                    var aWeightvalid = this._oPOModel.getProperty("/cWeightValid");
                    if (!aWeightvalid) {
                        var sText = "Please Pallatize the Products";
                        MessageBox.information(sText, {
                            // title: sTitle,
                            initialFocus: sap.m.MessageBox.Action.OK,
                            onClose: function (sButton) {
                                if (sButton === MessageBox.Action.OK) {
                                    that._openSupplierInfoDialog(aFreightOrder)
                                }
                            }
                        });
                    } else {
                        this._openSupplierInfoDialog(aFreightOrder)
                    }
                }
            },

            _openSupplierInfoDialog: function (aFreightOrder) {
                var aValidation = this._oPOModel.getProperty("/cValidData");
                if (!aValidation) {
                    if (!this._oDialogSupplierInfo) {
                        this._oDialogSupplierInfo = sap.ui.xmlfragment(
                            "ui.tm.vps.ztmvpsintutive.fragment.supplierInfo",
                            this
                        );
                        this.getView().addDependent(this._oDialogSupplierInfo);
                    }
                    sap.ui.getCore().byId("spslInstId").setValue(aFreightOrder.SpecialInstructions)
                    sap.ui.getCore().byId("inputNameId").setValue(aFreightOrder.SupplierName)
                    sap.ui.getCore().byId("inputPhoneNumId").setValue(aFreightOrder.SupplierNumber)
                    sap.ui.getCore().byId("inputEmailId").setValue(aFreightOrder.SupplierContact)
                    this._oDialogSupplierInfo.open();
                } else {
                    return;
                }
            },

            _ValidationMandatoryFields: function (aFreightOrder, cValidData) {
                //Validation start
                if (aFreightOrder.ItemPackagingMaterialCategory === "") {
                    MessageToast.show("Please Enter Package Info");
                    cValidData = true;
                    this._oPOModel.setProperty("/cValidData", cValidData);
                    return;
                }
                if (aFreightOrder.ItemPackagingMaterialType === "") {
                    MessageToast.show("Please Select Package Type");
                    cValidData = true;
                    this._oPOModel.setProperty("/cValidData", cValidData);
                    return;
                }
                if (aFreightOrder.ItemPackageQty <= 0) {
                    MessageToast.show("Please Enter Valid Package Qty");
                    cValidData = true;
                    this._oPOModel.setProperty("/cValidData", cValidData);
                    return;
                }
                if (aFreightOrder.ItemLength <= 0) {
                    MessageToast.show("Please Enter Valid Length");
                    cValidData = true;
                    this._oPOModel.setProperty("/cValidData", cValidData);
                    return;
                }
                if (aFreightOrder.ItemWidth <= 0) {
                    MessageToast.show("Please Enter Valid Width");
                    cValidData = true;
                    this._oPOModel.setProperty("/cValidData", cValidData);
                    return;
                }
                if (aFreightOrder.ItemHeight <= 0) {
                    MessageToast.show("Please Enter Valid Height");
                    cValidData = true;
                    this._oPOModel.setProperty("/cValidData", cValidData);
                    return;
                }
                if (aFreightOrder.ItemLengthUnit === "") {
                    MessageToast.show("Please Choose Dimensions Unit");
                    cValidData = true;
                    this._oPOModel.setProperty("/cValidData", cValidData);
                    return;
                }
                if (aFreightOrder.ItemWeight <= 0) {
                    MessageToast.show("Please Enter Valid Weight");
                    cValidData = true;
                    this._oPOModel.setProperty("/cValidData", cValidData);
                    return;
                }
                if (aFreightOrder.ItemWeightUnit === "") {
                    MessageToast.show("Please Choose Weight Unit");
                    cValidData = true;
                    this._oPOModel.setProperty("/cValidData", cValidData);
                    return;
                }
                if (aFreightOrder.PickupDate === "") {
                    MessageToast.show("Please Select Pick-Up Date");
                    cValidData = true;
                    this._oPOModel.setProperty("/cValidData", cValidData);
                    return;
                }
                if (aFreightOrder.ItemWeight >= 150 && aFreightOrder.ItemWeightUnit === "LB") {
                    this._oPOModel.setProperty("/cWeightValid", false);
                }

            },

            onPressCancel: function () {
                this._oDialogSupplierInfo.close();
                this._oDialogSupplierInfo.destroy();
                this._oDialogSupplierInfo = null;
            },

            onPressSave: function (oEvent) {
                var that = this;
                var sSpecialInst = sap.ui.getCore().byId("spslInstId").getValue();
                var sSupplierName = sap.ui.getCore().byId("inputNameId").getValue();
                var sSupplierPh = sap.ui.getCore().byId("inputPhoneNumId").getValue();
                var sSupplierEmail = sap.ui.getCore().byId("inputEmailId").getValue();
                this._oPOModel.setProperty("/SupplierName", sSupplierName);
                this._oPOModel.setProperty("/SpecialInst", sSpecialInst);
                this._oPOModel.setProperty("/SupplierPh", sSupplierPh);
                this._oPOModel.setProperty("/SupplierEmail", sSupplierEmail);
                this.onPressCancel();
                var i;
                var oUpdateModel = this.getView().getModel();
                var gettingInternalTable = this.byId("LineItemsSmartTable").getTable();
                var gettingAllRows = gettingInternalTable.getBinding().aKeys;
                var oSelIndices = gettingInternalTable.getSelectedIndices();
                for (i = 0; i < oSelIndices.length; i++) {
                    var oFreightOrder = this.getView().getModel().getObject("/" + gettingAllRows[oSelIndices[i]]);
                    var sFO = oFreightOrder.TransportationOrderItemUUID;
                    // RSR - Set PickUp Location Selected Key if no Location Binded to the Property
                    if (oFreightOrder.ItemPickupLocation === "") {
                        var oPath = gettingAllRows[oSelIndices[i]];
                        this._setLocUpdate(oPath, oFreightOrder);
                    } else {
                        var sPOPayload = {
                            "TransportationOrderItemUUID": sFO,
                            "FreightUnitUUID": oFreightOrder.FreightUnitUUID,
                            "ItemPackagingMaterialCategory": oFreightOrder.ItemPackagingMaterialCategory,
                            "ItemPackagingMaterialType": oFreightOrder.ItemPackagingMaterialType,
                            "ItemPackageQty": oFreightOrder.ItemPackageQty,
                            "ItemLength": this.restrictEditDecimal(oFreightOrder.ItemLength),
                            "ItemWidth": this.restrictEditDecimal(oFreightOrder.ItemWidth),
                            "ItemHeight": this.restrictEditDecimal(oFreightOrder.ItemHeight),
                            "ItemLengthUnit": oFreightOrder.ItemLengthUnit,
                            "ItemWeight": this.restrictEditDecimal(oFreightOrder.ItemWeight),
                            "ItemWeightUnit": oFreightOrder.ItemWeightUnit,
                            "PickupDate": this.convertDateUTC(oFreightOrder.PickupDate),
                            "ItemPickupLocation": oFreightOrder.ItemPickupLocation,
                            "MonetaryValue": oFreightOrder.MonetaryValue,
                            "MonetaryValueCrcy": oFreightOrder.MonetaryValueCrcy,
                            "ItemTrackingNumber": oFreightOrder.ItemTrackingNumber,
                            "DangerousGoodsIndicator": oFreightOrder.DangerousGoodsIndicator,
                            "SpecialInstructions": this._oPOModel.getProperty("/SpecialInst"),
                            "SupplierName": this._oPOModel.getProperty("/SupplierName"),
                            "SupplierNumber": this._oPOModel.getProperty("/SupplierPh"),
                            "SupplierContact": this._oPOModel.getProperty("/SupplierEmail"),
                        };
                        var path = "/" + gettingAllRows[oSelIndices[i]];
                        oUpdateModel.update(path, sPOPayload, {
                            success: function (oData, response) {
                                MessageToast.show("Freight Unit " + oFreightOrder.FreightUnitID + " Updated successfully");
                            },
                            error: function (oError) {
                                MessageToast.show("Error " + oFreightOrder.FreightUnitID + " Update request failed");
                            }
                        });
                    }
                    //
                }
            },
            _setLocUpdate: function (oPath, oFreightOrder) {
                var that = this;
                var oUpdateModel = this.getView().getModel();
                var oLocPath = "/" + oPath + "/to_PickupLocation";
                oUpdateModel.read(oLocPath, {
                    success: function (oData, response) {
                        var selectedData = oData.results[0].PickupLocation;
                        oFreightOrder.ItemPickupLocation = selectedData;
                        var sPOPayload = {
                            "TransportationOrderItemUUID": oFreightOrder.TransportationOrderItemUUID,
                            "FreightUnitUUID": oFreightOrder.FreightUnitUUID,
                            "ItemPackagingMaterialCategory": oFreightOrder.ItemPackagingMaterialCategory,
                            "ItemPackagingMaterialType": oFreightOrder.ItemPackagingMaterialType,
                            "ItemPackageQty": oFreightOrder.ItemPackageQty,
                            "ItemLength": that.restrictEditDecimal(oFreightOrder.ItemLength),
                            "ItemWidth": that.restrictEditDecimal(oFreightOrder.ItemWidth),
                            "ItemHeight": that.restrictEditDecimal(oFreightOrder.ItemHeight),
                            "ItemLengthUnit": oFreightOrder.ItemLengthUnit,
                            "ItemWeight": that.restrictEditDecimal(oFreightOrder.ItemWeight),
                            "ItemWeightUnit": oFreightOrder.ItemWeightUnit,
                            "PickupDate": that.convertDateUTC(oFreightOrder.PickupDate),
                            "ItemPickupLocation": oFreightOrder.ItemPickupLocation,
                            "MonetaryValue": oFreightOrder.MonetaryValue,
                            "MonetaryValueCrcy": oFreightOrder.MonetaryValueCrcy,
                            "ItemTrackingNumber": oFreightOrder.ItemTrackingNumber,
                            "DangerousGoodsIndicator": oFreightOrder.DangerousGoodsIndicator,
                            "SpecialInstructions": that._oPOModel.getProperty("/SpecialInst"),
                            "SupplierName": that._oPOModel.getProperty("/SupplierName"),
                            "SupplierNumber": that._oPOModel.getProperty("/SupplierPh"),
                            "SupplierContact": that._oPOModel.getProperty("/SupplierEmail"),
                        };
                        var path = "/" + oPath;
                        oUpdateModel.update(path, sPOPayload, {
                            success: function (oData, response) {
                                MessageToast.show("Freight Unit " + oFreightOrder.FreightUnitID + " Updated successfully");
                            },
                            error: function (oError) {
                                MessageToast.show("Error " + oFreightOrder.FreightUnitID + " Update request failed");
                            }
                        });
                    }
                });
            },
            onSplitPress: function (oEvent) {
                var oBindingContext = oEvent.getSource().getBindingContext();
                var context = this.getView().getModel().getContext(oBindingContext.getPath());
                var sPath = context.getPath();
                var sSplitQty = this.getOwnerComponent().getModel("i18n").getProperty("splitQuantity");
                this.openSplitQtyDialog(this, "", context, sSplitQty);
            },
            onSupplierPress: function (oEvent) {
                var oBindingContext = oEvent.getSource().getBindingContext();
                var context = this.getView().getModel().getContext(oBindingContext.getPath());
                var sPath = context.getPath();
                var sSupplierHeader = this.getOwnerComponent().getModel("i18n").getProperty("supplierDetails");
                this.openSupplierDialog(this, "", context, sSupplierHeader);
            },
            onRowSelect: function (oEvent) {
                var gettingInternalTable = this.byId("LineItemsSmartTable").getTable();
                var oSelIndices = gettingInternalTable.getSelectedIndices();
                if (oSelIndices.length <= 1) {
                    this.getView().byId("idAssignPO").setVisible(false);
                } else {
                    this.getView().byId("idAssignPO").setVisible(true);
                }

            },

            onAssignPress: function () {
                var gettingInternalTable = this.byId("LineItemsSmartTable").getTable();
                var gettingAllRows = gettingInternalTable.getBinding().aKeys;
                var oSelIndices = gettingInternalTable.getSelectedIndices();
                var aFreightOrder = this.getView().getModel().getObject("/" + gettingAllRows[oSelIndices[0]]);
                if (!this._oDialogAssignPO) {
                    this._oDialogAssignPO = sap.ui.xmlfragment(
                        "ui.tm.vps.ztmvpsintutive.fragment.assignPODetails",
                        this
                    );
                    // Location Binding in assign PO Details fragment
                    var oPath = "/ZTM_C_VendorFreightUnits(" + "guid" + "'" + aFreightOrder.TransportationOrderItemUUID + "')/to_PickupLocation";
                    this._setPreLoadData(oPath, aFreightOrder);
                    this.getView().addDependent(this._oDialogAssignPO);
                }
                this._oDialogAssignPO.open();
            },
            _setPreLoadData: function (oPath, aFreightOrder) {
                var oLocation = sap.ui.getCore().byId("inputLoc");
                var oLocationItemSelectTemplate = new sap.ui.core.ListItem({ key: "{PickupLocation}", text: "{LocationDescription}" });
                oLocation.bindItems({
                    path: oPath,
                    template: oLocationItemSelectTemplate
                });
                var oPackageType = sap.ui.getCore().byId("inputPackType");
                var oPackageTypeSelectTemplate = new sap.ui.core.ListItem({ key: "{PackagingMaterialType}", text: "{PackagingMaterialType}", additionalText: "{PackagingMaterialCategory}" });
                oPackageType.bindItems({
                    path: "/ZTM_I_PackagingMaterialTypeHV",
                    template: oPackageTypeSelectTemplate
                });
                var oDimUnit = sap.ui.getCore().byId("inputDimUnitId");
                var oDimUnitSelectTemplate = new sap.ui.core.ListItem({ key: "{UnitOfMeasure}", text: "{UnitOfMeasure}", additionalText: "{UnitOfMeasure_Text}" });
                oDimUnit.bindItems({
                    path: "/C_ProductLengthUoMVH",
                    template: oDimUnitSelectTemplate
                });
                var oWeightUnit = sap.ui.getCore().byId("InputWeightUnit");
                var oWeightUnitSelectTemplate = new sap.ui.core.ListItem({ key: "{WeightUnit}", text: "{WeightUnit}", additionalText: "{WeightUnit_Text}" });
                oWeightUnit.bindItems({
                    path: "/C_Weightuom",
                    template: oWeightUnitSelectTemplate
                });
                sap.ui.getCore().byId("spslInstId").setValue(aFreightOrder.SpecialInstructions);
                sap.ui.getCore().byId("inputNameId").setValue(aFreightOrder.SupplierName);
                sap.ui.getCore().byId("inputPhoneNumId").setValue(aFreightOrder.SupplierNumber);
                sap.ui.getCore().byId("inputEmailId").setValue(aFreightOrder.SupplierContact);
            },
            onAssignDialogAcceptClick: function () {
                var that = this;
                var sWeight = sap.ui.getCore().byId("inputWeight").getValue();
                var sWeightUOM = sap.ui.getCore().byId("InputWeightUnit").getValue();
                if (sWeight >= 150 && sWeightUOM === "LB") {
                    // MessageBox.information("Please Pallatize the Products");
                    var sText = "Please Pallatize the Products";
                    MessageBox.information(sText, {
                        // title: sTitle,
                        initialFocus: sap.m.MessageBox.Action.OK,
                        onClose: function (sButton) {
                            if (sButton === MessageBox.Action.OK) {
                                that._ValidateMultipleUpdate();
                            }
                        }
                    });
                } else {
                    this._ValidateMultipleUpdate();
                }
            },

            _ValidateMultipleUpdate: function () {
                var sPackMat = sap.ui.getCore().byId("inputPackInfo").getValue();
                var sPackType = sap.ui.getCore().byId("inputPackType").getValue();
                var sPackQty = sap.ui.getCore().byId("inputPackQty").getValue();
                var sLength = sap.ui.getCore().byId("inputLength").getValue();
                var sWidth = sap.ui.getCore().byId("inputWidth").getValue();
                var sHeight = sap.ui.getCore().byId("inputHeight").getValue();
                var sDimUOM = sap.ui.getCore().byId("inputDimUnitId").getValue();
                var sWeight = sap.ui.getCore().byId("inputWeight").getValue();
                var sWeightUOM = sap.ui.getCore().byId("InputWeightUnit").getValue();
                var sPickupLoc = sap.ui.getCore().byId("inputLoc").getSelectedKey();
                var sPickUpDate = sap.ui.getCore().byId("inputDate").getDateValue();

                //Validation start
                if (sPackMat === "") {
                    sap.ui.getCore().byId("inputPackInfo").setValueState("Error");
                    return;
                } else {
                    sap.ui.getCore().byId("inputPackInfo").setValueState("None");
                }
                if (sPackType === "") {
                    sap.ui.getCore().byId("inputPackType").setValueState("Error");
                    return;
                } else {
                    sap.ui.getCore().byId("inputPackType").setValueState("None");
                }
                if (sPackQty <= 0) {
                    sap.ui.getCore().byId("inputPackQty").setValueState("Error");
                    return;
                } else {
                    sap.ui.getCore().byId("inputPackQty").setValueState("None");
                }
                if (sLength <= 0) {
                    sap.ui.getCore().byId("inputLength").setValueState("Error");
                    return;
                } else {
                    sap.ui.getCore().byId("inputLength").setValueState("None");
                }
                if (sWidth <= 0) {
                    sap.ui.getCore().byId("inputWidth").setValueState("Error");
                    return;
                } else {
                    sap.ui.getCore().byId("inputWidth").setValueState("None");
                }
                if (sHeight <= 0) {
                    sap.ui.getCore().byId("inputHeight").setValueState("Error");
                    return;
                } else {
                    sap.ui.getCore().byId("inputHeight").setValueState("None");
                }
                if (sDimUOM === "") {
                    sap.ui.getCore().byId("inputDimUnitId").setValueState("Error");
                    return;
                } else {
                    sap.ui.getCore().byId("inputDimUnitId").setValueState("None");
                }
                if (sWeight <= 0) {
                    sap.ui.getCore().byId("inputWeight").setValueState("Error");
                    return;
                } else {
                    sap.ui.getCore().byId("inputWeight").setValueState("None");
                }
                if (sWeightUOM === "") {
                    sap.ui.getCore().byId("InputWeightUnit").setValueState("Error");
                    return;
                } else {
                    sap.ui.getCore().byId("InputWeightUnit").setValueState("None");
                }
                if (sPickupLoc === "") {
                    sap.ui.getCore().byId("inputLoc").setValueState("Error");
                    return;
                } else {
                    sap.ui.getCore().byId("inputLoc").setValueState("None");
                }
                if (!sPickUpDate || sPickUpDate === "") {
                    sap.ui.getCore().byId("inputDate").setValueState("Error");
                    return;
                } else {
                    sap.ui.getCore().byId("inputDate").setValueState("None");
                }
                this._updateMultiplePOs();
            },

            _updateMultiplePOs: function () {
                var i;
                var that = this;
                var oUpdateModel = this.getView().getModel();
                oUpdateModel.sDefaultUpdateMethod = "PUT";
                var gettingInternalTable = this.byId("LineItemsSmartTable").getTable();
                var gettingAllRows = gettingInternalTable.getBinding().aKeys;
                var oSelIndices = gettingInternalTable.getSelectedIndices();
                var sPackMat = sap.ui.getCore().byId("inputPackInfo").getValue();
                var sPackType = sap.ui.getCore().byId("inputPackType").getValue();
                var sPackQty = sap.ui.getCore().byId("inputPackQty").getValue();
                var sLength = sap.ui.getCore().byId("inputLength").getValue();
                var sWidth = sap.ui.getCore().byId("inputWidth").getValue();
                var sHeight = sap.ui.getCore().byId("inputHeight").getValue();
                var sDimUOM = sap.ui.getCore().byId("inputDimUnitId").getValue();
                var sWeight = sap.ui.getCore().byId("inputWeight").getValue();
                var sWeightUOM = sap.ui.getCore().byId("InputWeightUnit").getValue();
                var sPickupLoc = sap.ui.getCore().byId("inputLoc").getSelectedKey();
                var sPickUpDate = sap.ui.getCore().byId("inputDate").getDateValue();
                var sSpslInst = sap.ui.getCore().byId("spslInstId").getValue();
                var sSupName = sap.ui.getCore().byId("inputNameId").getValue();
                var sSupNum = sap.ui.getCore().byId("inputPhoneNumId").getValue();
                var sSupContact = sap.ui.getCore().byId("inputEmailId").getValue();
                for (i = 0; i < oSelIndices.length; i++) {
                    var oFreightOrder = this.getView().getModel().getObject("/" + gettingAllRows[oSelIndices[i]]);
                    var sFO = oFreightOrder.TransportationOrderItemUUID;
                    var sPOPayload = {
                        "TransportationOrderItemUUID": sFO,
                        "FreightUnitUUID": oFreightOrder.FreightUnitUUID,
                        "ItemPackagingMaterialCategory": sPackMat,
                        "ItemPackagingMaterialType": sPackType,
                        "ItemPackageQty": sPackQty,
                        "ItemLength": this.restrictEditDecimal(sLength),
                        "ItemWidth": this.restrictEditDecimal(sWidth),
                        "ItemHeight": this.restrictEditDecimal(sHeight),
                        "ItemLengthUnit": sDimUOM,
                        "ItemWeight": this.restrictEditDecimal(sWeight),
                        "ItemWeightUnit": sWeightUOM,
                        "PickupDate": this.convertDateUTC(sPickUpDate),
                        "ItemPickupLocation": sPickupLoc,
                        "MonetaryValue": oFreightOrder.MonetaryValue,
                        "MonetaryValueCrcy": oFreightOrder.MonetaryValueCrcy,
                        "ItemTrackingNumber": oFreightOrder.ItemTrackingNumber,
                        "DangerousGoodsIndicator": oFreightOrder.DangerousGoodsIndicator,
                        "SpecialInstructions": sSpslInst,
                        "SupplierName": sSupName,
                        "SupplierNumber": sSupNum,
                        "SupplierContact": sSupContact,
                    };
                    var path = "/" + gettingAllRows[oSelIndices[i]];
                    oUpdateModel.update(path, sPOPayload, {
                        success: function (oData, response) {
                            gettingInternalTable.getModel().refresh(true);
                            MessageToast.show("Multiple Update Success");
                            that.onAssignDialogCancelClick();
                        },
                        error: function (oError) {
                            gettingInternalTable.getModel().refresh(true);
                            MessageBox.error("Multiple Update Fail");
                        }
                    });
                }
            },

            onAssignDialogCancelClick: function () {
                // if (this._oDialogAssignPO) {
                this._oDialogAssignPO.close();
                this._oDialogAssignPO.destroy();
                this._oDialogAssignPO = null;
                // }
            },
            onFAQPress: function (oEvent) {
                this._oFAQViewer = new sap.m.PDFViewer();
                this.getView().addDependent(this._oFAQViewer);
                var sServiceURL = this.getView().getModel().sServiceUrl;
                var sSource = sServiceURL + "/ZTM_C_MIME('FAQ')/$value";
                this._oFAQViewer.setSource(sSource);
                this._oFAQViewer.setTitle("FAQ");
                this._oFAQViewer.open();
            },
            onPAQClose: function () {
                this._oFAQViewer.close();
                this._oFAQViewer.destroy();
                this._oFAQViewer = null;
            },
            onPDFViewerPress: function (oEvent) {
                var oBindingContext = oEvent.getSource().getBindingContext();
                var context = this.getView().getModel().getContext(oBindingContext.getPath());
                var that = this;
                var myModel = this.getOwnerComponent().getModel();
                sap.ui.getCore().setModel(myModel);
                var sSource = "/ZTM_C_BoLAttachment";
                myModel.read(sSource, {
                    success: function (oData, oResponse) {
                        var aData = oData.results[0].AttachmentNodeUUID;
                        that._pdfViewer(aData);
                    }
                });
            },
            _pdfViewer: function (aNodeID) {
                this._oPDFViewer = new sap.m.PDFViewer();
                this.getView().addDependent(this._oPDFViewer);
                var sServiceURL = this.getView().getModel().sServiceUrl;
                var sSource = sServiceURL + "/ZTM_C_BoLAttachment('" + aNodeID + "')/$value";
                this._oPDFViewer.setSource(sSource);
                this._oPDFViewer.setTitle("BOL");
                this._oPDFViewer.open();
            },
            onPDFClose: function () {
                this._oPDFViewer.close();
                this._oPDFViewer.destroy();
                this._oPDFViewer = null;
            },

            onPDFUploadPress: function (oEvent) {
                var oBindingContext = oEvent.getSource().getBindingContext();
                var context = this.getView().getModel().getContext(oBindingContext.getPath());
                var sBOLAttachment = this.getOwnerComponent().getModel("i18n").getProperty("uploadFile");
                this.openBOLAttachmentDialog(this, "", context, sBOLAttachment);
            },

            restrictEditDecimal: function (iNumber) {
                return parseFloat(iNumber).toFixed(2);
            },

            getDestinationLoc: function (DestinationHouseNumber, DestinationStreetName, DestinationCityName, DestinationLocationDescr, DestinationCountry) {
                if (!DestinationLocationDescr) {
                    DestinationLocationDescr = "";
                }
                return DestinationLocationDescr.concat(",", DestinationStreetName, ",", DestinationCityName, ",", DestinationCountry);
            },

            convertDateUTC: function (sDate) {
                var iYear = sDate.getUTCFullYear();
                var iMonth = sDate.getUTCMonth();
                var iDay = sDate.getUTCDate();
                var iHour = sDate.getUTCHours();
                var iMinute = sDate.getUTCMinutes();
                var dDate = new Date(Date.UTC(iYear, iMonth, iDay, iHour, iMinute));
                return dDate;
            },
            getPlanningStatusState: function (sStatus) {
                if (sStatus === false) {
                    return "Success";
                } else {
                    return "Error";
                }
            },
            getPlanningStatusIcon: function (sStatus) {
                if (sStatus === false) {
                    return "sap-icon://sys-enter-2"
                } else {
                    return "sap-icon://error"
                }
            },

            onBeforeRebindTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams"),
                    sStatusValue = this._oCustomSelect.getSelectedKey();
                if (sStatusValue) {
                    mBindingParams.filters.push(
                        new Filter(
                            "FreightUnitPlanningBlock",
                            FilterOperator.EQ,
                            sStatusValue
                        )
                    );
                }
            },
            onAfterRendering: function (event) {
                var defaultDeliverDate = this.getView().byId("filterDeliverDate");
                var valueComp = {
                    "operator": "GE",
                    "low": this.oDefaultDate
                };
                // defaultDeliverDate.addDefaultFilterValue(new sap.ui.comp.smartfilterbar.SelectOption().setLow(this.oDefaultDate));
                defaultDeliverDate.addDefaultFilterValue(new sap.ui.comp.smartfilterbar.SelectOption(valueComp));
            },

            onRefreshPress: function () {
                this.byId("LineItemsSmartTable").rebindTable();
            }
        });
    });
