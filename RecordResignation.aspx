<%@ Page Language="C#" MasterPageFile="~masterurl/default.master" Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage,Microsoft.SharePoint,Version=15.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" meta:progid="SharePoint.WebPartPage.Document" meta:webpartpageexpansion="full" %>

<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Import Namespace="Microsoft.SharePoint" %>
<%@ Assembly Name="Microsoft.Web.CommandUI, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceHolderPageTitle" runat="server">
Record Resignation 
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
Record Resignation         
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
	<link href="../_layouts/15/WingsAssets/Styles/jquery-ui-1.10.4.custom.css" type="text/css" />
    <script type="text/javascript" src="../Jquery/jquery-2.1.1.js"></script>
    <script type="text/javascript" src="_layouts/15/WingsAssets/Scripts/jquery-ui-1.10.4.custom.min.js"></script>
    <script type="text/javascript" src="../Knockout/knockout-3.1.0.js"></script>
    <script type="text/javascript" src="../Scripts/crud.js"></script>
    <script type="text/javascript" src="../Scripts/notifications.js"></script>
    <script type="text/javascript" src="../Scripts/modelDialog.js"></script>    
    <script type="text/javascript" src="../AdminPresenter/WeeklyOff.js"></script>
    <script type="text/javascript" src="../HRTaskModel/RecordResignation.js"></script>
    <script type="text/javascript"> 
  			$(function() {
  			
	  			$( "#txtResignationLetterDate" ).datepicker();
			    $( "#txtRequestRelievingDate" ).datepicker();
  			    $( "#txtActualRelievingDate" ).datepicker();
  			    
  			    
/*    			$( "#txtResignationLetterDate" ).datepicker({ dateFormat: 'dd/mm/yy' }).val();   
			    $( "#txtRequestRelievingDate" ).datepicker({ dateFormat: 'dd/mm/yy' }).val();  
  			    $( "#txtActualRelievingDate" ).datepicker({ dateFormat: 'dd/mm/yy' }).val();  
 */   			//$("#txtRequestRelievingDate").attr("disabled", "disabled");
				//$("#txtActualRelievingDate").attr("disabled", "disabled");		
  			});  			
  </script>
  <style type="text/css">
	.left-block {
            float: left;
            width: 39em;
        }

            .left-block > span {
                display: block;
            }

        .right-block > span {
            display: block;
        }

        .left-block span:nth-child(2) {
            float: right;
            margin-right: 6em;
            width: 15em;
        }

     /*   .left-block span label {
            float: right;
        }*/

        .right-block {
            float: left;
            width: 39em;
        }
      
        .left-block span:nth-child(1) {
            /*float:left;
	*/
        }

        .right-block span:nth-child(2) {
            float: right;
            margin-right: 6em;
            width: 16em;
        }
        .button-group {
            margin-top: 16em;
        }
        
         table.dataTable tr.odd {
            background-color: azure;
        }

            table.dataTable tr.odd td.sorting_1 {
                background-color: azure !important;
            }

        table.dataTable tr.even td.sorting_1 {
            background-color: white !important;
        }

        tr {
            border-color: black !important;
        }
          .selected{
      background-color:#71C0DA !important;
		}
		
		

	  #main-form {
            width: 98% !important;
            height: 40em !important;
            margin-top: 5em !important;
            margin-left: 1em !important;           
            background-color: azure !important;
            box-shadow: 10px 10px 5px #888888 !important;
            width: 90% !important;
            height: 24em !important;
        }
	</style>

</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceHolderMain" runat="server">
	<!--XSLT List view web part-->	
	Search Employee <input type="text" id="txtSearchEmployee" />
	 <input type="button" id="btnGetData" value="Go" onclick="getAllInformationOfEmployee()" />
	 	 <input type="button" id="btnData" value="test" onclick="getEmployeesAddress()" />

	 <br />	 <br />	 <br />
	<div id="RecordResignaiton">
		<table id="employeeData" >
		<col width="200" />
		<col width="200" />
		<col width="200" />
		<col width="200" />
		<tr>
			<td>Employee Name:</td>
			<td><label id="lblEmployeeName"></label></td>
			<td>Employee Id:</td>
			<td><label id="lblEmployeeId"></label></td>
		</tr>
		<tr>
			<td>Date Of Joining:</td>
			<td><label id="lblDateOfJoining"></label></td>
			<td>Designation:</td>
			<td><label id="lblDesignation"></label></td>
		</tr>
		<tr>
			<td>Grade:</td>
			<td><label id="lblGrade"></label></td>
			<td>Business Unit:</td>
			<td><label id="lblBusinessUnit"></label></td>
		</tr>
		<tr>
			<td>Location:</td>
			<td><label id="lblLocation"></label></td>
			<td>Department:</td>
			<td><label id="lblDepartment"></label></td>
		</tr>		
		<tr>
			<td>Functional Reporting To:</td>
			<td><label id="lblFunctionalReportingManager"></label></td>
			<td>Reporting Manager:</td>
			<td><label id="lblReportingManager"></label></td>
		</tr>
		</table>
	</div>
	<div id="main-form">
	<div class="left-block">
		<span>
		<span>Separation Type: </span>
		<span>
			<select name="ddlSeperationType" id="ddlSeperationType" data-bind="value:seperationType">
			  <option value="select">--Select--</option>			  
			</select>
		</span>
		</span>	
		<br/>
		<span>
	 		<span>Resignation Reason: </span>
		<span>
			<select name="ddlResignationReason" id="ddlResignationReason" data-bind="value:resignationReason">
			  <option value="select">--Select--</option>
			</select>
		</span>
		</span>
		<br/>
		<span>
			<span>Resignation Letter Date: </span>
		<span>		
 			 <input type="text" id="txtResignationLetterDate" data-bind="value:resignationLetterDate"  />
		</span>
		</span><br/>
		<span>
			<span>Request Relieving Date</span>
		<span>		
 			 <input type="text" id="txtRequestRelievingDate" data-bind="value:requestRelievingDate" />
		</span>		
		</span>
		<br/>
		<span>
			<span>Actual Relieving Date</span>
		<span>		
 			 <input type="text" id="txtActualRelievingDate" data-bind="value:actualRelievingDate" />
		</span>
		</span>
		<br/>
		<span>
			<span>Mailing Address Same as</span>
		<span>				
			<select name="MailingAddress" data-bind="value:mailingAddress">
			  <option value="Permanent Address">Permanent Address</option>
			  <option value="Current Address">Current Address</option>
			  <option value="Other Address">Other Address</option>
			</select>
		</span>
		</span>
		<br/>
		<span>
			<span>Next Employer</span>
		<span>				
			<textarea id="txtNextEmployer" data-bind="value:nextEmployer">
			</textarea>
		</span>
		</span>
	</div>
	
	
		<div class="right-block">
		<span>
		<span class="key">End of Notice Period: </span>
		<span class="value">
			<input type="text" id="txtEndofNoticePeriod" data-bind="value:endOfNoticePeriod" />			
		</span>
		</span>
		<br/>
		<span>
	 		<span>Notice Period: </span>
		<span>
			<label id="lblNoticePeriod"></label>
		</span>
		</span>
		<br/>
		
		<span>
			<span>Notice Period Short fall: </span>
		<span>		
			<label id="lblNoticePeriodShortFall" data-bind="value:noticePeriodShortFall"></label>
		</span>
	</span>
	<br/>
	<span>
			<span>Personal Email Address</span>
		<span>				
			<input type="text" id="txtPersonalEmailAddress"  />
		</span>
		</span>
		<br/>
	<span>
		<span>Description of Reason</span>
		<span>		
			<textarea id="txtReasonDescription" data-bind="value:descriptionReason"></textarea>
		</span>		
		</span>
		<br/>
		<span>
		<span>Other Address</span>
		<span>		
			<textarea id="txtOtherAddress"></textarea>
		</span>
		</span>	
	</div>	
	<div id="buttons">
		<span> <input type="button" id="btnSubmit" value="Submit" name="Submit" data-bind="click:submit" /></span>
		<span> <input type="button" id="btnCancel" value="Cancel" /></span>
	</div>
	</div>

</asp:Content>
