/*
following function will fetch the data from REST query 
REST Query: 
http://para12ksp03:5000/wings/_api/web/lists/getbyTitle('basicemployeedetails')/items?$select=OfficialName

function will return the employeeData: officialName of the employee from basicemployeedetails list.
*/

function getEmployeeNames() {
    var TypeObject = new Object();
    TypeObject.listName = "BasicEmployeeDetails";
    TypeObject.query = "$select=OfficialName,EmployeeNo";
    employeeData = getListItems(TypeObject).d.results;
    //    console.log(JSON.stringify(employeeData));
    return employeeData;
}

//created new array for storing name of the employees which will be used in auto complete filed
var employees = [];
var employeeOfficalName;
var employeeId;
/*
following function will take data from above function and only add official name of the employee to array
function array.push() is used to add employee information to array.
*/
function AddDataToAutoComplete() {
    var dataFetched = getEmployeeNames();
    if (dataFetched.length != 0) {
        $.each(dataFetched, function (i) {
            employeeOfficalName = dataFetched[i].OfficialName;
            employeeId = dataFetched[i].EmployeeNo;
            employees.push({
                label: employeeOfficalName,
                value: employeeId
            })
        });
    }
}

function getEmployeesAddress() {
    var TypeObject = new Object();
    TypeObject.listName = "ContactDetails";
    TypeObject.query = "$select=EmployeeAdNameId,WorkZip,HomeAddressStreet,HomeAddressCity,HomeAddressStateOrProvince,WorkState,CountryLookup/WorkCountry,CityLookup/WorkCity,RegionLookup/Title,OData__DCDateModified,WorkState&$expand=CountryLookup, CityLookup, RegionLookup&$filter=EmployeeAdName eq '1'";
    employeeAddress = getListItems(TypeObject).d.results;
    $("#txtOtherAddress").val(employeeAddress[0].HomeAddressStreet + ", " + employeeAddress[0].HomeAddressCity + ", " + employeeAddress[0].HomeAddressStateOrProvince + ", " + employeeAddress[0].CityLookup.WorkCity + ", " + employeeAddress[0].RegionLookup.Title + ", " + employeeAddress[0].WorkState + ", " + employeeAddress[0].CountryLookup.WorkCountry + ", " + employeeAddress[0].WorkZip

    );
}

function getEmployeesCurrentAddress() {
    var TypeObject = new Object();
    TypeObject.listName = "ContactDetails";
    TypeObject.query = "$select=EmployeeAdNameId,CurrentZipcode,OtherAddressStreet,OtherAddressCity,OtherAddressStateOrProvince,CurrentState,OtherCountryLookup/WorkCountry,OtherCityLookup/WorkCity,OtherRegionLookup/Title,OData__DCDateModified,WorkState&$expand=OtherCountryLookup, OtherCityLookup, OtherRegionLookup&$filter=EmployeeAdName eq '1'";
    employeeCurrentAddress = getListItems(TypeObject).d.results;
    $("#txtOtherAddress").val(employeeCurrentAddress[0].OtherAddressStreet + ", " + employeeCurrentAddress[0].OtherAddressCity + ", " + employeeCurrentAddress[0].OtherAddressStateOrProvince + ", " + employeeCurrentAddress[0].OtherCityLookup.WorkCity + ", " + employeeCurrentAddress[0].OtherRegionLookup.Title + ", " + employeeCurrentAddress[0].CurrentState + ", " + employeeCurrentAddress[0].OtherCountryLookup.WorkCountry + ", " + employeeCurrentAddress[0].CurrentZipcode);
}


function getAllInformationOfEmployee() {
    $("#lblEmployeeName").text("");
    $("#lblEmployeeId").text("");
    $("#lblDateOfJoining").text("");
    $("#lblGrade").text("");
    $("#lblDesignation").text("");
    $("#lblLocation").text("");
    $("#lblDepartment").text("");
    $("#lblFunctionalReportingManager").text("");
    $("#lblReportingManager").text("");
    var TypeObject = new Object();
    TypeObject.listName = "BasicEmployeeDetails";
    TypeObject.query = "$select=EmployeeNo,OfficialName,ReportingManagerId,FunctionalManagerId,DateOfJoin,LocationLookup/Location,DepartmentLookup/Title,DesignationLookup/Designation,GradeLookup/Title,OUNameLookup/Title&$expand=LocationLookup,DepartmentLookup,DesignationLookup,GradeLookup,OUNameLookup&$filter=EmployeeNo eq '" + employeeId + "'";
    employeeAllData = getListItems(TypeObject).d.results;
    var str = employeeAllData[0].DateOfJoin;
    var res = str.substring(0, 10);
    $("#lblEmployeeName").text(employeeAllData[0].OfficialName);
    $("#lblEmployeeId").text(employeeAllData[0].EmployeeNo);
    $("#lblDateOfJoining").text(res);
    $("#lblGrade").text(employeeAllData[0].GradeLookup.Title);
    $("#lblDesignation").text(employeeAllData[0].DesignationLookup.Designation);
    $("#lblLocation").text(employeeAllData[0].LocationLookup.Location);
    $("#lblDepartment").text(employeeAllData[0].DepartmentLookup.Title);
    var reportingManager = getUserFromId(employeeAllData[0].ReportingManagerId);
    $("#lblReportingManager").text(reportingManager);
    var functionalManager = getUserFromId(employeeAllData[0].FunctionalManagerId);
    $("#lblFunctionalReportingManager").text(functionalManager);
    var noticePeridValue = getNoticePeriod();
    $("#lblNoticePeriod").text(noticePeridValue);
    return employeeAllData;
}


function getUserFromId(userid) {
    // var userid = _spPageContextInfo.userId;
    var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + userid + ")";
    var requestHeaders = {
        "accept": "application/json;odata=verbose"
    };
    $.ajax({
        url: requestUri,
        async: false,
        contentType: "application/json;odata=verbose",
        headers: requestHeaders,
        success: onSuccess,
        error: onError
    });

    function onSuccess(data, request) {
        var Logg = data.d;
        userLoginName = Logg.Title;
    }

    function onError(error) {
        alert("error");
    }
    return userLoginName;
}

//following function will fetch the data from seperation type list.
function GetSeperationType() {
    var TypeObject = new Object();
    TypeObject.listName = "SeparationTypes";
    TypeObject.query = "$select=ID,Title";
    seperationTypeData = getListItems(TypeObject).d.results;
    //    console.log(JSON.stringify(seperationTypeData));
    return seperationTypeData;
}

//following function will add the data to seperation type dropdown list which are fetched 
// in above function GetSeperationType.
function addDataToSeperationTypeDropdown() {
    var select = document.getElementById('ddlSeperationType');
    var dataFetched = GetSeperationType();
    if (dataFetched.length != 0) {
        $.each(dataFetched, function (i) {
            seperationType = dataFetched[i].Title;
            seperationTypeId = dataFetched[i].ID;
            select.options[select.options.length] = new Option(seperationType, seperationTypeId);
        });
    }
}


//following function will fetch the data from resignation reason list.
function getResignationReasons() {
    var TypeObject = new Object();
    TypeObject.listName = "ResignationReasons";
    TypeObject.query = "$select=ID,Title";
    reasonData = getListItems(TypeObject).d.results;
    return reasonData;
}

//following function will add the data to resignation reason dropdown list which are fetched 
// in above function getResignationReasons.
function addDataToResignationReasonDropdown() {
    var select = document.getElementById('ddlResignationReason');
    var dataFetched = getResignationReasons();
    if (dataFetched.length != 0) {
        $.each(dataFetched, function (i) {
            reason = dataFetched[i].Title;
            reasonId = dataFetched[i].ID;
            select.options[select.options.length] = new Option(reason, reasonId);
        });
    }
}

//get notice period from configuration editor
function getNoticePeriod() {
    var TypeObject = new Object();
    TypeObject.listName = "ConfigurationEditors";
    TypeObject.query = "$select=ConfigValue&$filter=ConfigName eq 'Notice_Period'";
    NoticePeriod = getListItems(TypeObject).d.results;
    return NoticePeriod[0].ConfigValue;
}


function getIdFromADName(employeeId) {
    var TypeObject = new Object();
    TypeObject.listName = "BasicEmployeeDetails";
    TypeObject.query = "$select=EmployeeAdNameId,OfficialName&$filter=EmployeeNo eq '" + employeeId + "'";
    NoticePeriod = getListItems(TypeObject).d.results;
    return NoticePeriod[0].EmployeeAdNameId;
}


function calculateRequestRelievingDate() {
    var noticePeridValue = getNoticePeriod();
    var datepicker = $("#txtResignationLetterDate").val();
    var requestRelievingDate = new Date(datepicker);
    requestRelievingDate.setDate(requestRelievingDate.getDate() + parseInt(noticePeridValue));

    var dateString = (requestRelievingDate.getMonth() + 1) + "/" + requestRelievingDate.getDate() + "/" + requestRelievingDate.getFullYear();

    $("#txtRequestRelievingDate").val(dateString);
    $("#txtActualRelievingDate").val(dateString);
}

function calculateNoticePeriodShortFall() {
    var noticePeridValue = getNoticePeriod();
    var letterDate = new Date($("#txtResignationLetterDate").val());
    var actualDate = new Date($("#txtActualRelievingDate").val());
    var timeDiff = Math.abs(actualDate.getTime() - letterDate.getTime());
    var diffDaysInDates = Math.ceil(timeDiff / (1000 * 3600 * 24));
    var noticePeriodShortFall = noticePeridValue - diffDaysInDates;
    //	alert("diffDays "+diffDaysInDates );
    //	alert("noticePeriodShortFall " + noticePeriodShortFall );
    $("#lblNoticePeriodShortFall").text(noticePeriodShortFall);

}

/*
 //Get the id of employee AD name.
    function getADNameId(adName) {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/SiteUsers?$Select=Id,Title&$filter=Title eq '" + adName + "'",
            type: "GET",
            async: false,
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose"
            },
            success: function (data) {
                console.log(JSON.stringify(data));
                reportingManagerData = data.d.results;
                
            },
            error: function (err) {
                console.log(JSON.stringify(err));
            }
        });
        return reportingManagerData[0].Id; 
    }

*/

$(document).ready(function () {

    $("#address").change(function () {
        var addressType = $(this).val();
        if (addressType == "Permanent Address") {
            $("#txtOtherAddress").prop("readonly", true);
            getEmployeesAddress();
        }
        if (addressType == "Current Address") {
            $("#txtOtherAddress").prop("readonly", true);
            getEmployeesCurrentAddress();
        }
        if (addressType == "Other Address") {
            $("#txtOtherAddress").prop("readonly", false);
            $("#txtOtherAddress").val("");
        }


    });


    var id = null;

    function AppViewModel() {
        var self = this;
        self.seperationType = ko.observable();
        self.resignationReason = ko.observable();
        self.resignationLetterDate = ko.observable();
        self.requestRelievingDate = ko.observable();
        self.actualRelievingDate = ko.observable();
        self.mailingAddress = ko.observable();
        self.nextEmployer = ko.observable();
        self.endOfNoticePeriod = ko.observable();
        self.noticePeriodShortFall = ko.observable();
        self.descriptionReason = ko.observable();
        // self.otherAddress = ko.observable();
        // self.personalEmailAddress = ko.observable();
        self.submit = function () {
            alert(employeeId);
            self.noticePeriodShortFall($("#lblNoticePeriodShortFall").text());
            dialogWithNoButton("Please Wait", "Saving your data");
            var dataObject = new Object();
            var listName = 'RecordResignations';
            var fieldData = [
                ['Title', employeeId],
                ['EmployeeAdNameId', getIdFromADName(employeeId)],
                ['ResignationLetterDate', $("#txtResignationLetterDate").val()],
                ['SeperationTypeId', self.seperationType()],
                ['ResignationReasonId', self.resignationReason()],
                ['RequestRelievingDate', $("#txtRequestRelievingDate").val()],
                ['ActualRelievingDate', $("#txtActualRelievingDate").val()],
                ['MailingAddressSameAs', self.mailingAddress()],
                ['NextEmployer', $("#txtNextEmployer").val()],
                ['EndOfNoticePeriod', $("#txtEndofNoticePeriod").val()],
                ['NoticePeriodShortFall', $("#lblNoticePeriodShortFall").val()],
                ['DescriptionOfReason', $("#txtReasonDescription").val()]
            ];

            var listDataObj = new listData(listName, fieldData, id);
            if (id == null) { // check for save or update data.
                //Save Data;
                addListItem(listDataObj,

                function (data) {
                    successStatus("Data Saved Successfully");
                    closeModelDialog();
                    //ResetFields();
                    //                            refreshWebPart();
                },

                function (err) {
                    //alert(JSON.stringify(err));
                    //alert(err);
                    closeModelDialog();
                    var errorString = JSON.parse(err.responseText);
                    errorStatus("Error: " + errorString.error.message.value);
                    // refreshWebPart();
                });
            }

        }

    }

    ko.applyBindings(new AppViewModel());

    addDataToSeperationTypeDropdown();
    addDataToResignationReasonDropdown();
    AddDataToAutoComplete();
    //followin function will be used to add employee's name to auto complete field
    $("#txtSearchEmployee").autocomplete({
        source: employees,
        select: function (event, ui) {
            $("#txtSearchEmployee").val(ui.item.value + '-' + ui.item.label);
            employeeId = ui.item.value;
            return false;
        }
    });

    $("#txtResignationLetterDate").on("change", function () {
        calculateRequestRelievingDate();
        calculateNoticePeriodShortFall();
    });
    $("#txtActualRelievingDate").on("change", function () {
        calculateNoticePeriodShortFall();
    });

});
