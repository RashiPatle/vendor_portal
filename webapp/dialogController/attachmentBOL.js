/*eslint linebreak-style: ["error", "windows"]*/
jQuery.sap.declare("ui.tm.vps.ztmvpsintutive.dialogController.attachmentBOL");

ui.tm.vps.ztmvpsintutive.dialogController.attachmentBOL = {
    _oDialogNameSpace: "ui.tm.vps.ztmvpsintutive",
    _oDialogThis: undefined,
    _oDialogFragmentId: "",
    _oCompController: null,
    _oThisFOContext: null,
    _oSelectedFO: null,

    openBOLAttachmentDialog: function (oThis, sParent, context, sTitle) {
        this._oDialogThis = oThis;
        this._oThisFOContext = context;
        this._oDialogFragmentId = "idDialogAttachmentBOL" + oThis.getView().getId();
        this._oCompController = this._oDialogThis.getOwnerComponent();
        var sPath = context.sPath;
        var oBindingContext = context.getObject();
        var oModel = this._oDialogThis.getView().getModel();
        this._oDialogThis.getView().getModel().setDefaultBindingMode("TwoWay");

        // RSR - PO Details Model to store all requried data //
        this._oPOModel = this._oDialogThis.getOwnerComponent().getModel("oPOModel");

        if (!this._oBOLAttachmentDialog) {
            this._oBOLAttachmentDialog = sap.ui.xmlfragment(this._oDialogFragmentId,
                this._oDialogNameSpace + ".fragment.Dialog.PDFDoc",
                this
            );
            this._oDialogThis.getView().addDependent(this._oBOLAttachmentDialog);
        }

        sap.ui.getCore().byId(this._oDialogFragmentId + "--idDialogAttachmentBOL").setModel(oModel);
        sap.ui.getCore().byId(this._oDialogFragmentId + "--idDialogAttachmentBOL").setTitle(sTitle);
        sap.ui.getCore().byId(this._oDialogFragmentId + "--idDialogAttachmentBOL").bindElement(sPath);

        //set the current FO
        this._oSelectedFO = oBindingContext.FreightOrderID;
        this._oBOLAttachmentDialog.open();
    },
    onRejectAttachemnt: function () {
        this._oBOLAttachmentDialog.close();
        this._oBOLAttachmentDialog.destroy();
        this._oBOLAttachmentDialog = null;
        this._oThisFOContext = null;
        this._oSelectedFO = null;
    },
    onConfirmAddAttachemnt: function () {

        var oFileUploader = sap.ui.getCore().byId(this._oDialogFragmentId + "--fileUploader");
        var sMsg = "";

        //check file has been entered
        var sFile = oFileUploader.getValue();
        if (!sFile) {
            sMsg = "Please select a file first";
            sap.m.MessageToast.show(sMsg);
            return;
        }
        else {
            var that = this;
            that._addTokenToUploader();
            oFileUploader.upload();
            that.onRejectAttachemnt();

        }
    },

    _addTokenToUploader: function () {
        //Add header parameters to file uploader.
        var oDataModel = this._oDialogThis.getView().getModel();
        var sTokenForUpload = oDataModel.getSecurityToken();
        var oFileUploader = sap.ui.getCore().byId(this._oDialogFragmentId + "--fileUploader");
        var oHeaderParameter = new sap.ui.unified.FileUploaderParameter({
            name: "X-CSRF-Token",
            value: sTokenForUpload
        });

        var sFile = this._oSelectedFO;
        var oHeaderSlug = new sap.ui.unified.FileUploaderParameter({
            name: "SLUG",
            value: sFile
        });

        //Header parameter need to be removed then added.
        oFileUploader.removeAllHeaderParameters();
        oFileUploader.addHeaderParameter(oHeaderParameter);

        oFileUploader.addHeaderParameter(oHeaderSlug);
        //set upload url
        var sUrl = oDataModel.sServiceUrl + "/ZTM_C_BoLAttachment";
        oFileUploader.setUploadUrl(sUrl);
    },
    handleUploadComplete: function (oEvent) {
        // var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
        var sMsg = "";
        var sMsgType = "Error";
        var oResponse = oEvent.getParameters("response");
        if (oResponse) {
            if (oResponse.status === 201) {
                //TODO use i18n
                //sMsg = "Upload Success";
                sMsg = this._parseResponse(oResponse.headers["sap-message"], 9);
                sMsgType = "Information";
            } else {
                sMsg = this._parseResponse(oResponse.responseRaw, 23);
            }
        }
        sap.m.MessageToast.show("File Uploaded");
    }
};