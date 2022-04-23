sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"

], function (BaseController, JSONModel, mobileLibrary, Filter, FilterOperator) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return BaseController.extend("zsample2.controller.Detail", {


		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit : function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
			});

			this.getRouter().getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		onListUpdateFinished : function (oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");

			// only update the counter if the length is final
			if (this.byId("idTable").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		},

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {

			var oViewModel = this.getModel("detailView");

			var sCarrid =  oEvent.getParameter("arguments").carrid;
			var sConnid =  oEvent.getParameter("arguments").connid;

			let that = this;
			let oModel = this.getView().getModel("main");

			var mFilter = [];
					mFilter.push(new Filter({
						path: 'carrid',
						operator: FilterOperator.EQ,
						value1: sCarrid,
					}));
			
					mFilter.push(new Filter({
						path: 'connid',
						operator: FilterOperator.EQ,
						value1: sConnid,
					}));

			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");

					this.getOwnerComponent().getModel().read("/ES_TEMP_DSet", {
					filters : mFilter,
					success : function(oEvent){
						if(oEvent.results.length > 0){
							oModel.setProperty('/it_data2', oEvent.results);
						}else{
							oModel.setProperty('/it_data2', null);
						}
                        
					},
					error : function(oEvent){
						MessageBox.show('조회 실패');
					}
				});

		},

		/**
		 * Set the full screen mode to false and navigate to master page
		 */
		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		/**
		 * Toggle between full and non full screen mode.
		 */
		toggleFullScreen: function () {
			var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (!bFullScreen) {
				// store current layout and go full screen
				this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
				this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			} else {
				// reset to previous layout
				this.getModel("appView").setProperty("/layout",  this.getModel("appView").getProperty("/previousLayout"));
			}
		}
	});

});