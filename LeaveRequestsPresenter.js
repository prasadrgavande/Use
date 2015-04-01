/*
Date:30 March 15 
Developer: Prasad
Remain Functionality : User should get to know, how much days are going to be deducted from leave balance
Changed: Changed datepicker, added functionality,"To Date" populates automatically

*/


var selectedLeaveTypeId, employeesToBeNotifiedId = "",
    employeesToBeNotified = [],
    employeesToWorkHandoverId = "",
    employeesToWorkHandover = [],
    noOfLeave, balanceListItemId;

function getLeaveConfigurationsRecords() {
    var leaveConfigurationRecords = new Object();
    leaveConfigurationRecords.listName = "LeaveConfigurations";
    leaveConfigurationRecords.query = "";
    var leaveConfigurationsListItems = getListItems(leaveConfigurationRecords);
    return leaveConfigurationsListItems;
}

function getLeaveBalanceRecords() {
    var leaveBalanceRecords = new Object();
    leaveBalanceRecords.listName = "LeaveBalanceAdjustments";
    leaveBalanceRecords.query = "";
    var leaveBalanceListItems = getListItems(leaveBalanceRecords);
    return leaveBalanceListItems;
}


//following function will give the count of previously applied leave by User
// for eg. if user has applied for 2 leaves previously on any days then it will give the count as 2
function getLeaveRequestRecordsByQuery(query) {
    var leaveRequestRecords = new Object();
    leaveRequestRecords.listName = "LeaveRequests";
    leaveRequestRecords.query = query;
    var leaveRequestListItems = getListItems(leaveRequestRecords);
    return leaveRequestListItems;
}

function getBasicEmplyeesRecords() {
    var basicEmplyeesRecords = new Object();
    basicEmplyeesRecords.listName = "BasicEmployeeDetails";
    basicEmplyeesRecords.query = "";
    var basicEmployeeDetailsListItems = getListItems(basicEmplyeesRecords);
    return basicEmployeeDetailsListItems;
}

function getBasicEmplyeesRecord(query) {
    var basicEmplyeesRecord = new Object();
    basicEmplyeesRecord.listName = "BasicEmployeeDetails";
    basicEmplyeesRecord.query = query;
    var basicEmployeeDetailsListItem = getListItems(basicEmplyeesRecord);
    return basicEmployeeDetailsListItem;
}

function getLeaveConfigurationRecord(id) {
    var leaveConfigurationRecord = new Object();
    leaveConfigurationRecord.listName = "LeaveConfigurations";
    leaveConfigurationRecord.query = "$filter=Id eq '" + id + "'";
    var leaveConfigurationRecordListItem = getListItems(leaveConfigurationRecord);
    return leaveConfigurationRecordListItem;
}

function getHolidaysByCalander(calanderId) {
    var holidayRecords = new Object();
    holidayRecords.listName = "Holidays";
    holidayRecords.query = "$filter=CalendarLookup eq '" + calanderId + "'";
    var holidayItems = getListItems(holidayRecords);
    return holidayItems;
}

function getCurrentEmployeeLeaves(fromDate, toDate) {
    //var dayPart = fromDate.
    //    debugger;
    var datePartFromDate = fromDate.getDate();
    datePartFromDate = datePartFromDate - 1;
    fromDate.setDate(datePartFromDate);
    var datePartToDate = toDate.getDate();
    datePartToDate = datePartToDate + 1;
    toDate.setDate(datePartToDate);

    var leaveRecords = new Object();
    leaveRecords.listName = "LeaveRequests";
    leaveRecords.query = "$filter=Author eq '" + _spPageContextInfo.userId + "' and LeaveRequestFromDate ge '" + fromDate.format("MM/dd/yyyy") + "' and LeaveRequestToDate le '" + toDate.format("MM/dd/yyyy") + "'";
    var leaveItems = getListItems(leaveRecords);
    return leaveItems;
}

$(document).ready(function () {
    jQuery('#txtFromDate').datetimepicker({
        timepicker: false,
        format: 'm/d/Y',
        minDate: '0', //yesterday is minimum date(for today use 0 or -1970/01/01)
        onChangeDateTime: function (dp, $input) {
            $('#txtToDate').val($input.val());
            checkDateDifference();
        },
        onSelectDate: function (ct, $i) {
            checkDateDifference();
        }
    });

    jQuery('#txtToDate').datetimepicker({
        timepicker: false,
        format: 'm/d/Y',
        minDate: $("#txtFromDate").val(), //yesterday is minimum date(for today use 0 or -1970/01/01)
        onChangeDateTime: function (dp, $input) {
            alert("changed To date")
            checkDateDifference();
        },
        onSelectDate: function (ct, $i) {
            alert("selected To date")
            checkDateDifference();
        }
    });
    var objectleaveRequestViewModel = new leaveRequestViewModel();
    resetRadioTypes(); // on form load reset    
    function checkDateDifference() {
        if ($("#txtToDate").val() != "" && $("#txtFromDate").val() != "") {
            checkSameDates();
            $("#lblEstimateCalculatedDays").val(); // nuliffy 
            var dateObject = new Object();
            dateObject.fromDate = new Date($("#txtFromDate").val());
            dateObject.toDate = new Date($("#txtToDate").val());
            dateObject.fromType = $("input[name=FromType]:checked").val();
            dateObject.toType = $("input[name=ToType]:checked").val();
            //            console.log("dateObject : " + JSON.stringify(dateObject));
            var temp = DaysDifference(dateObject);
            $("#lblEstimateCalculatedDays").text(temp + " Day/(s) of leave");
            noOfLeave = temp;
        }
    }

    /*   $("#txtFromDate").datepicker({
        onSelect: function () {
            checkDateDifference();
        }
    });
    $("#txtToDate").datepicker({
        onSelect: function () {
            checkDateDifference();
        }
    }); */
    $("input[name=FromType]:radio").change(function () {
        resetRadioTypes();

        //validations
        if ($("input[name=FromType]:checked").val() == "FD") {
            // if no to type is selected
            if (!getToTypeSelectionStatus()) {
                $("#rbToTypeFD").prop('checked', true); // check
            }
        } else if ($("input[name=FromType]:checked").val() == "FN") {
            $("#txtToDate").val($("#txtFromDate").val()); // make both dates same
            disableToType()
        } else if ($("input[name=FromType]:checked").val() == "AN") {
            // if no to type is selected
            if (!getToTypeSelectionStatus()) {
                $("#rbToTypeFD").prop('checked', true); // check
            }
        }
        checkDateDifference();

    });
    $("input[name=ToType]:radio").change(function () {
        checkDateDifference();
    });

    function leaveRequestViewModel() {
        var self = this;
        self.LeaveType = ko.observable();
        self.FromDate = ko.observable();
        self.ToDate = ko.observable();
        self.EstimateCalculatedDays = ko.observable();
    }
    ko.applyBindings(objectleaveRequestViewModel);
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        //Your code goes here...
        var ctx = new SP.ClientContext.get_current();
        var web = ctx.get_web();
        ctx.load(web);
        var user = web.get_currentUser();
        //        console.log(user);
        //alert(user);
    });


    //  $('#demo').html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="example"></table>');
    leaveBalanceListItems = getLeaveBalanceRecords();
    leaveConfigurationsListItems = getLeaveConfigurationsRecords();
    var employeeRecord = getBasicEmplyeesRecord("$filter=EmployeeAdName eq '" + _spPageContextInfo.userId + "'");
    var daysUntilJoining = differenceOfToDatesInDays(new Date, new Date(employeeRecord.d.results[0].DateOfJoin));
    var leaveRequestCount = 0;
    $.each(leaveConfigurationsListItems.d.results, function (i) {
        var leaveNotToBeClubWithString = "";
        //self.certificateArray.push(new certificateClass(certificateListItem.d.results[i].ID, certificateListItem.d.results[i].Title));
        if (leaveConfigurationsListItems.d.results[i].LeaveTypeNotToClubWithId.results != undefined) {
            $.each(leaveConfigurationsListItems.d.results[i].LeaveTypeNotToClubWithId.results, function (j) {
                var leaveNotToBeClubWithId = leaveConfigurationsListItems.d.results[i].LeaveTypeNotToClubWithId.results[j];
                var leaveNotToBeClubWithData = getLeaveConfigurationRecord(leaveNotToBeClubWithId);
                leaveNotToBeClubWithData = leaveNotToBeClubWithData.d.results[0];
                var leaveNotToBeClubWithCode = leaveNotToBeClubWithData.Code;
                var leaveNotToBeClubWithName = leaveNotToBeClubWithData.Title;
                leaveNotToBeClubWithString += '</br>' + leaveNotToBeClubWithCode + " - " + leaveNotToBeClubWithName;
                //alert(leaveConfigurationsListItems.d.results[i].LeaveTypeNotToClubWithId.results[j]);
            });

        }

        $.each(leaveBalanceListItems.d.results, function (j) {
            //alert(leaveConfigurationsListItems.d.results[i].Id);
            if (leaveConfigurationsListItems.d.results[i].Id == leaveBalanceListItems.d.results[j].LeaveTypeId && leaveBalanceListItems.d.results[j].EmployeeAdNameId == _spPageContextInfo.userId && leaveConfigurationsListItems.d.results[i].WaitingPeriodInDays < daysUntilJoining) {
                leaveRequestCount++;
                var validTill;
                if (leaveBalanceListItems.d.results[j].LeaveValidTillDate != null) {
                    validTill = leaveBalanceListItems.d.results[j].LeaveValidTillDate;
                } else {
                    validTill = "";

                }
                $('#tbody').append('<tr><td>' + leaveRequestCount + '</td><td>' + leaveConfigurationsListItems.d.results[i].Code + '</td><td>' + leaveConfigurationsListItems.d.results[i].Title + '</td><td>' + leaveBalanceListItems.d.results[j].LeaveBalance + '</td><td>' + leaveBalanceListItems.d.results[j].PastPreviousBalance + '</td><td>' + leaveConfigurationsListItems.d.results[i].CurrentYearNegativeBalanceAllowed + '</td><td>' + leaveConfigurationsListItems.d.results[i].AllowHalfDays + '</td><td>' + leaveConfigurationsListItems.d.results[i].MinimumDaysToApply + '</td><td>' + leaveConfigurationsListItems.d.results[i].MaximumDaysToApply + '</td><td>' + leaveNotToBeClubWithString + '</td><td>' + validTill + '</td><td hidden>' + leaveConfigurationsListItems.d.results[i].Id + '</td><td hidden>' + leaveBalanceListItems.d.results[j].Id + '</td></tr>');
            }
        });

    });

    var table = $('#example').dataTable();
    $('#example tbody').on('click', 'tr', function () {
        //alert("s");
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            $("#idHomePageNewItem").click();
            //alert( $(this).children().eq(11).text());

            var PendingDaysData = new Object();
            PendingDaysData.leaveType = $(this).children().eq(11).text();
            PendingDaysData.loginUserId = _spPageContextInfo.userId;
            $("#lblDaysPendingForApproval").text(getPendingDaysForApproval(PendingDaysData));
            $("#lblAvailableBalance").text($(this).children().eq(3).text());

            selectedLeaveTypeId = $(this).children().eq(11).text();
            $("#lblLeaveType").val($(this).children().eq(1).text());
            balanceListItemId = $(this).children().eq(12).text();
        }
    });

    $('#button').click(function () {
        table.row('.selected').remove().draw(false);
    });

});

$(document).on('click', '#btnEmployeesToBeNotified', function () {
    basicEmployeeDetailsListItems = getBasicEmplyeesRecords();
    //    console.log("basicEmployeeDetailsListItems " + basicEmployeeDetailsListItems);
    $("#tblEmployeesToBeNotified").dataTable().fnDestroy();
    $('#tblEmployeesToBeNotified tbody').empty();
    $.each(basicEmployeeDetailsListItems.d.results, function (i) {
        $('#tbodyEmployeesToBeNotified').append('<tr><td><input type="checkbox" name="ckbEmp" class="ckbEmp" /></td><td>' + basicEmployeeDetailsListItems.d.results[i].EmployeeNo + '</td><td>' + basicEmployeeDetailsListItems.d.results[i].OfficialName + '</td><td>' + basicEmployeeDetailsListItems.d.results[i].DateOfJoin + '</td><td>' + basicEmployeeDetailsListItems.d.results[i].DesignationLookupId + '</td><td>' + basicEmployeeDetailsListItems.d.results[i].GradeLookupId + '</td><td>' + basicEmployeeDetailsListItems.d.results[i].OUNameLookupId + '</td><td hidden>' + basicEmployeeDetailsListItems.d.results[i].EmployeeAdNameId + '</td>');
    });

    var employeesToBeNotifiedTable = $('#tblEmployeesToBeNotified').dataTable();
    $('#main-section').block({
        message: $("#divEmployeesToBeNotified")
    });
    $("#divEmployeesToBeNotified").parent().attr("id", "divEmployeeListBlockUI");
});

$(document).on('click', '#btnChooseEmployeesToBeNotified', function () {
    var employeesToBeNotifiedId = "";
    var checkedBoxes = $('input[class=ckbEmp]:checked');
    $.each(checkedBoxes, function (i) {
        if (employeesToBeNotifiedId == "") {

            employeesToBeNotifiedId = $(this).parent().parent().children().eq(1).text();
        } else {
            employeesToBeNotifiedId += ",";
            employeesToBeNotifiedId += $(this).parent().parent().children().eq(1).text();
        }
        employeesToBeNotified.push($(this).parent().parent().children().eq(7).text())
    });
    $("#txtEmployeesToBeNotified").val(employeesToBeNotifiedId);
    $('#main-section').unblock();
    $('#main-section').block({
        message: $("#main-form")
    });
    $('div.blockUI.blockMsg.blockElement').attr("id", "Block-dialog-form");
    $('#Block-dialog-form').prepend('<span  class="form-title">Edit ' + $("#DeltaPlaceHolderPageTitleInTitleArea").text() + '</span>');
    $('#Block-dialog-form').append(' <img src="../_layouts/15/WingsAssets/Images/gnome_window_close.png" id="big-form-close-icon"class="Right-Slide-Form-icon" />')
    $('#main-form div span ').addClass("big-form-text");

});

$(document).on('click', '#btnEmployeesToWorkHandover', function () {
    var basicEmplyeesRecords = new Object();
    basicEmplyeesRecords.listName = "BasicEmployeeDetails";


    basicEmplyeesRecords.query = "$select=Title,ID,EmployeeNo,OfficialName,DateOfJoin,DesignationLookupId,GradeLookupId,OUNameLookupId,EmployeeAdNameId,GradeLookup/Title,OUNameLookup/Title,DesignationLookup/Designation&$expand=GradeLookup,OUNameLookup,DesignationLookup";
    basicEmployeeDetailsListItems = getListItems(basicEmplyeesRecords);
    //    console.log("basicEmployeeDetailsListItems " + JSON.stringify(basicEmployeeDetailsListItems));

    $("#tblEmployeesToWorkHandover").dataTable().fnDestroy();
    $('#tblEmployeesToWorkHandover tbody').empty();
    $.each(basicEmployeeDetailsListItems.d.results, function (i) {
        $('#tbodyEmployeesToWorkHandover').append('<tr><td><input type="checkbox" name="ckbEmp" class="ckbEmpHandover" /></td><td>' + basicEmployeeDetailsListItems.d.results[i].EmployeeNo + '</td><td>' + basicEmployeeDetailsListItems.d.results[i].OfficialName + '</td><td>' + basicEmployeeDetailsListItems.d.results[i].DateOfJoin + '</td><td>' + basicEmployeeDetailsListItems.d.results[i].DesignationLookup.Designation + '</td><td>' + basicEmployeeDetailsListItems.d.results[i].GradeLookup.Title + '</td><td>' + basicEmployeeDetailsListItems.d.results[i].OUNameLookup.Title + '</td><td hidden>' + basicEmployeeDetailsListItems.d.results[i].EmployeeAdNameId + '</td>');
    });

    var employeesToWorkHandover = $('#tblEmployeesToWorkHandover').dataTable();
    $('#main-section').block({
        message: $("#divEmployeesToWorkHandover")
    });
    $("#divEmployeesToWorkHandover").parent().attr("id", "divEmployeeListBlockUI");
});

$(document).on('click', '#btnChooseEmployeesToWorkHandover', function () {
    var employeesToWorkHandoverId = "";
    var checkedBoxes = $('input[class=ckbEmpHandover]:checked');
    $.each(checkedBoxes, function (i) {
        if (employeesToWorkHandoverId == "") {

            employeesToWorkHandoverId = $(this).parent().parent().children().eq(1).text();
        } else {
            employeesToWorkHandoverId += ",";
            employeesToWorkHandoverId += $(this).parent().parent().children().eq(1).text();
        }
        employeesToWorkHandover.push($(this).parent().parent().children().eq(7).text())
    });
    $("#txtHandedOverWorkTo").val(employeesToWorkHandoverId);
    $('#main-section').unblock();
    $('#main-section').block({
        message: $("#main-form")
    });
    $('div.blockUI.blockMsg.blockElement').attr("id", "Block-dialog-form");
    $('#Block-dialog-form').prepend('<span  class="form-title">Edit ' + $("#DeltaPlaceHolderPageTitleInTitleArea").text() + '</span>');
    $('#Block-dialog-form').append(' <img src="../_layouts/15/WingsAssets/Images/gnome_window_close.png" id="big-form-close-icon"class="Right-Slide-Form-icon" />')
    $('#main-form div span ').addClass("big-form-text");

});

function DaysDifference(DateData) {

    var oneDayMiliseconds = 86400000;
    //if User Applies For 1 day or half day


    if (DateData.toType == undefined) {
        if (DateData.fromType == "FD") {
            return (1);
        } else {
            return (0.5);
        }
    } else { // for multiple days
        // if FromType is FD and To Type is FD
        if (DateData.fromType == "FD" && DateData.toType == "FD") {
            return (((DateData.toDate.getTime() + oneDayMiliseconds) - DateData.fromDate.getTime()) / oneDayMiliseconds);
        }

        // if FromType is FD and To Type is FN
        if (DateData.fromType == "FD" && DateData.toType == "FN") {
            return (((DateData.toDate.getTime() + (oneDayMiliseconds / 2)) - DateData.fromDate.getTime()) / oneDayMiliseconds);
        }

        // if FromType is FD and To Type is AN
        if (DateData.fromType == "FD" && DateData.toType == "AN") {
            return (((DateData.toDate.getTime() + (oneDayMiliseconds / 2)) - DateData.fromDate.getTime()) / oneDayMiliseconds);
        }

        // if FromType is AN and To Type is FD
        if (DateData.fromType == "AN" && DateData.toType == "FD") {
            return (((DateData.toDate.getTime() + (oneDayMiliseconds / 2)) - DateData.fromDate.getTime()) / oneDayMiliseconds);
        }

        // if FromType is AN and To Type is FN
        if (DateData.fromType == "AN" && DateData.toType == "FN") {
            return ((DateData.toDate.getTime() - DateData.fromDate.getTime()) / oneDayMiliseconds);
        }

        // if FromType is AN and To Type is AN
        if (DateData.fromType == "AN" && DateData.toType == "AN") {
            return ((DateData.toDate.getTime() - DateData.fromDate.getTime()) / oneDayMiliseconds);
        }
    }
}

function resetRadioTypes() {
    $("#rbFromTypeFD").prop("disabled", false);
    $("#rbFromTypeFN").prop("disabled", false);
    $("#rbFromTypeAN").prop("disabled", false);

    $("#rbToTypeFD").prop("disabled", false);
    $("#rbToTypeFN").prop("disabled", false);
    $("#rbToTypeAN").prop("disabled", false);
}

function getToTypeSelectionStatus() {
    if ($("#rbToTypeFD").prop('checked') || $("#rbToTypeFN").prop('checked')) {
        return true;
    }
    return false;
}

function checkSameDates() {
    if ($("#txtToDate").val() == $("#txtFromDate").val()) {
        disableToType();
        return true;
    }
    resetRadioTypes();
    return false;
}

function disableToType() {
    $("#rbToTypeFD").prop("disabled", true); // Disable
    $("#rbToTypeFD").prop('checked', false) // Uncheck

    $("#rbToTypeFN").prop("disabled", true); // Disable
    $("#rbToTypeFN").prop('checked', false) // Uncheck

    $("#rbToTypeAN").prop("disabled", true); // Disable
    $("#rbToTypeAN").prop('checked', false) // Uncheck    
}

function differenceOfToDatesInDays(firstDate, secondDate) {
    var oneDay = 24 * 60 * 60 * 1000;
    firstDate.setHours(0, 0, 0, 0);
    secondDate.setHours(0, 0, 0, 0);
    //    console.log("firstDate " + firstDate);
    //    console.log("secondDate " + secondDate);
    var diffDays = Math.round((firstDate.getTime() - secondDate.getTime()) / (oneDay));
    return diffDays;
}

function commonTabValidation() {
    //debugger;
    var commonTabValidated = false;
    var leaveConfigurationRecord = getLeaveConfigurationRecord(selectedLeaveTypeId);
    var differenceOfDateForFromDate = differenceOfToDatesInDays(new Date($("#txtFromDate").val()), new Date());
    var differenceOfDateForToDate = differenceOfToDatesInDays(new Date($("#txtToDate").val()), new Date());
    //alert(differenceOfDate );
    //Start Allow Past Days
    if (leaveConfigurationRecord.d.results[0].AllowPastDays == "No") {
        if (differenceOfDateForFromDate < 0) {
            alert("Past Leave Not Allowed");
            return false;
        } else {
            alert("past leave are allow");
        }
    }
    if (leaveConfigurationRecord.d.results[0].AllowPastDays == "Yes") {
        //    alert("differenceOfDateForFromDate -" + differenceOfDateForFromDate );
        var pastDaysCount = differenceOfDateForFromDate * (-1);
        //        alert("pastDaysCount " + pastDaysCount );
        //        alert("allow past days count = " + leaveConfigurationRecord.d.results[0].AllowPastDaysCount);
        if (pastDaysCount > leaveConfigurationRecord.d.results[0].AllowPastDaysCount && leaveConfigurationRecord.d.results[0].AllowPastDaysCount != "0") {
            alert("More than " + leaveConfigurationRecord.d.results[0].AllowPastDaysCount + " days Past Leave is not allowed");
            return false;
        }
    }

    //End Allow Past Days
    //Start Allow Future Days
    if (leaveConfigurationRecord.d.results[0].AllowFutureDays == "No") {
        alert("differenceOfDateForToDate " + differenceOfDateForToDate);
        if (differenceOfDateForToDate > 0) {
            alert("Future Leave Not Allowed");
            return false;
        } else {
            //alert("Yes");
        }
    }
    if (leaveConfigurationRecord.d.results[0].AllowFutureDays == "Yes") {
        //    alert("allow future days yes");
        alert("differenceOfDateForToDate for future days- " + differenceOfDateForToDate);
        var futureDaysCount = differenceOfDateForToDate;
        if (futureDaysCount > leaveConfigurationRecord.d.results[0].AllowFutureDaysCount && leaveConfigurationRecord.d.results[0].AllowFutureDaysCount != '0') {
            alert("More than " + leaveConfigurationRecord.d.results[0].AllowFutureDaysCount + " days Future Leave is not allowed");
            return false;
        }
    }
    //End Allow Future Days
    //Start Max Days To Apply

    if (noOfLeave > leaveConfigurationRecord.d.results[0].MaximumDaysToApply && leaveConfigurationRecord.d.results[0].MaximumDaysToApply != "0") {
        alert("Only " + leaveConfigurationRecord.d.results[0].MaximumDaysToApply + " days leave can be applied in one transaction");
        return false;
    }
    //End Max Days To Apply
    //Start Min Days To Apply
    if (noOfLeave < leaveConfigurationRecord.d.results[0].MinimumDaysToApply) {
        alert("Minimum " + leaveConfigurationRecord.d.results[0].MinimumDaysToApply + " days leave has to be applied");
        return false;
    }

    //End Min Days To Apply
    //Start Notice Period
    var daysBeforeLeave = differenceOfDateForToDate;
    //    alert("daysBeforeLeave = "+ daysBeforeLeave );
    //    alert("Notice period days" + leaveConfigurationRecord.d.results[0].NoticePeriodInDays );
    /*


// ------------------origional function ----------------
    if (leaveConfigurationRecord.d.results[0].NoticePeriodInDays < daysBeforeLeave) {
    alert(leaveConfigurationRecord.d.results[0].NoticePeriodInDays + " < " +  daysBeforeLeave)
        alert("notice < before ");
        alert("You have to apply atleast " + leaveConfigurationRecord.d.results[0].NoticePeriodInDays + " days prior to your leave");

        return false;
        

    }     
    */



    //changed by prasad --
    //bug :Notice period in common validation is not working 
    //solution changed condition from  leaveConfigurationRecord.d.results[0].NoticePeriodInDays > daysBeforeLeave 
    // to leaveConfigurationRecord.d.results[0].NoticePeriodInDays < daysBeforeLeave

    if (leaveConfigurationRecord.d.results[0].NoticePeriodInDays > daysBeforeLeave) {
        alert("You have to apply atleast " + leaveConfigurationRecord.d.results[0].NoticePeriodInDays + " days prior to your leave");
        return false;

    }
    //-------------end of changes

    //End Notice Period
    //Start Allow Days/Month
    var firsrtDayOfThisMonth = new Date();
    firsrtDayOfThisMonth.setDate(1);
    firsrtDayOfThisMonth = firsrtDayOfThisMonth.format("MM/dd/yyyy");
    var totalNumberLeaveCurrentMonth = 0;
    var leaveRequestRecordsOfCurrentMonth = getLeaveRequestRecordsByQuery("$filter=EmployeeAdName eq '" + _spPageContextInfo.userId + "'and Created ge '" + firsrtDayOfThisMonth + "'and LeaveType eq " + selectedLeaveTypeId + "'");
    $.each(leaveRequestRecordsOfCurrentMonth.d.results, function (i) {
        totalNumberLeaveCurrentMonth = totalNumberLeaveCurrentMonth + leaveRequestRecordsOfCurrentMonth.d.results[i].NumberOfLeaves;
    });
    totalNumberLeaveCurrentMonth = totalNumberLeaveCurrentMonth + noOfLeave;
    var allowDaysPerMonth = leaveConfigurationRecord.d.results[0].AllowDaysPerMonth;
    //alert("totalNumberLeaveCurrentMonth "+totalNumberLeaveCurrentMonth);
    if (totalNumberLeaveCurrentMonth > allowDaysPerMonth && allowDaysPerMonth != '0') {
        alert("You can apply for only " + allowDaysPerMonth + " days of leave per month");
        return false;
    }
    //End Allow Days/Month


    ///Bug: if MaximumApplicationsCount  = 0 then it should allow unlimited maximum application to apply per day/month for leave
    //modification 
    // added "maximumApplicationsCount != 0"  condition in if part of the code so that if maximum allowed application= 0 
    // in configuration then user can apply for unlimited number of days
    //Start Maximum Application

    var applicationUnit = leaveConfigurationRecord.d.results[0].MaximumApplicationsUnit;
    //   debugger; 
    var noOfLeavePerApplicationUnit = calculateNoOfApplication(applicationUnit);

    var maximumApplicationsCount = leaveConfigurationRecord.d.results[0].MaximumApplicationsCount;


    //alert("maximumApplicationsCount "+ maximumApplicationsCount );
    if (noOfLeavePerApplicationUnit >= maximumApplicationsCount && maximumApplicationsCount != 0) {
        alert("You can apply atmost " + maximumApplicationsCount + " Leave Request of this type per " + applicationUnit + "");
        return false;
    } else {}

    function calculateNoOfApplication(applicationUnit) {
        var totalNoOfLeave;
        var leaveRequestRecords = getLeaveRequestRecordsByQuery("$filter=EmployeeAdName eq '" + _spPageContextInfo.userId + "'and LeaveType eq " + selectedLeaveTypeId + "'");
        //console.log("leaveRequestRecords"+leaveRequestRecords);
        var currentDate = new Date();
        currentDate = currentDate.format("MM/dd/yyyy");
        switch (applicationUnit) {
            case "Day":
                //Start Day
                var leaveOnDay = 0;
                $.each(leaveRequestRecords.d.results, function (i) {
                    var allLeaveRequestDate = (new Date(leaveRequestRecords.d.results[i].Created)).format("MM/dd/yyyy");
                    if (allLeaveRequestDate == currentDate) {
                        leaveOnDay++;
                    }
                });
                totalNoOfLeave = leaveOnDay;
                //End Day
                break;
            case "Week":
                //Start Week
                function getMonday(d) {
                    d = new Date(d);
                    var day = d.getDay(),
                        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
                    return new Date(d.setDate(diff));
                }
                var firstDayOfThisWeek = getMonday(new Date());
                firstDayOfThisWeek = firstDayOfThisWeek.format("MM/dd/yyyy");
                //alert(firstDayOfThisWeek);
                var leaveRequestRecordsOfCurrentWeek = getLeaveRequestRecordsByQuery("$filter=EmployeeAdName eq '" + _spPageContextInfo.userId + "'and Created ge '" + firstDayOfThisWeek + "'and LeaveType eq " + selectedLeaveTypeId + "'");
                alert("Leave Request of this week " + leaveRequestRecordsOfCurrentWeek.d.results.length);
                totalNoOfLeave = leaveRequestRecordsOfCurrentWeek.d.results.length;
                //End Week           
                break;
            case "Month":
                //Start Month
                var firsrtDayOfThisMonth = new Date();
                firsrtDayOfThisMonth.setDate(1);
                firsrtDayOfThisMonth = firsrtDayOfThisMonth.format("MM/dd/yyyy");
                var leaveRequestRecordsOfCurrentMonth = getLeaveRequestRecordsByQuery("$filter=EmployeeAdName eq '" + _spPageContextInfo.userId + "'and Created ge '" + firsrtDayOfThisMonth + "'and LeaveType eq " + selectedLeaveTypeId + "'");
                //alert("leaveOnThisMonth"+leaveRequestRecordsOfCurrentMonth.d.results.length );
                totalNoOfLeave = leaveRequestRecordsOfCurrentMonth.d.results.length;
                //End Month           
                break;
            case "Year":
                //Start Year
                var firstDayOfYear = getFirstDayOfYear(new Date());
                //alert("firstDayOfYear "+firstDayOfYear );
                var leaveRequestRecordsOfCurrentYear = getLeaveRequestRecordsByQuery("$filter=EmployeeAdName eq '" + _spPageContextInfo.userId + "'and Created ge '" + firstDayOfYear + "'and LeaveType eq " + selectedLeaveTypeId + "'");
                //                alert("Leave Request of this Year " + leaveRequestRecordsOfCurrentYear.d.results.length);
                function getFirstDayOfYear(d) {
                    d = new Date(d);
                    d.setMonth(0);
                    d.setDate(1);
                    d = d.format("MM/dd/yyyy");
                    return d;
                }
                totalNoOfLeave = leaveRequestRecordsOfCurrentYear.d.results.length;
                //End Year
                break;
            case "Tenure":
                //Start Tenure
                var leaveRequestRecordsOfCurrentTenure = getLeaveRequestRecordsByQuery("$filter=EmployeeAdName eq '" + _spPageContextInfo.userId + "'and LeaveType eq " + selectedLeaveTypeId + "'");
                totalNoOfLeave = leaveRequestRecordsOfCurrentTenure.d.results.length;
                //End Tenure
                break;
            case "Quarter":
                //Start Quarter
                var firstDayOfQuarter = getFirstDayOfQuarter(new Date());
                var leaveRequestRecordsOfCurrentQuarter = getLeaveRequestRecordsByQuery("$filter=EmployeeAdName eq '" + _spPageContextInfo.userId + "'and Created ge '" + firstDayOfQuarter + "'and LeaveType eq " + selectedLeaveTypeId + "'");
                // alert("Leave Request of this quarter " + leaveRequestRecordsOfCurrentQuarter.d.results.length);
                function getFirstDayOfQuarter(d) {
                    d = new Date(d);
                    var month = d.getMonth();
                    //alert(month);
                    var firstMonthOfQuarter = parseInt((month + 1) / 3) * 3;
                    d.setMonth(parseInt(firstMonthOfQuarter));
                    d.setDate(1);
                    d = d.format("MM/dd/yyyy");
                    //      alert("firstMonthOfQuarter " + d);
                    return d;
                }
                totalNoOfLeave = leaveRequestRecordsOfCurrentQuarter.d.results.length;
                //End Quarter  

                break;
        }
        return (totalNoOfLeave);
    }
    //End Maximum Application
    //Start Restricted Calendar
    Date.prototype.addDays = function (days) {
        var dat = new Date(this.valueOf())
        dat.setDate(dat.getDate() + days);
        return dat;
    }

    function getDates(startDate, stopDate) {
        var dateArray = new Array();
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            dateArray.push(currentDate.format("MM/dd/yyyy"))
            currentDate = currentDate.addDays(1);
        }
        return dateArray;
    }

    function isDayHoliday(holidays, currentDate) {
        var flagReturn = false;
        $.each(holidays.d.results, function (i) {
            var holiday = (new Date(holidays.d.results[i].GraduationDate)).format("MM/dd/yyyy");
            if (holiday == currentDate) {
                flagReturn = true;
            }
        });
        return flagReturn;
    }
    if (leaveConfigurationRecord.d.results[0].RestrictedToId != "0") {
        var holidays = getHolidaysByCalander(leaveConfigurationRecord.d.results[0].RestrictedToId);
        var dateArray = getDates(new Date($("#txtFromDate").val()), new Date($("#txtToDate").val()));
        for (index = 0; index < dateArray.length; index++) {
            //var isHoliday = isDayHoliday(holidays,dateArray[index]);
            if (!isDayHoliday(holidays, dateArray[index])) {
                alert(dateArray[index] + " is not a holiday");
                return false;
            }
        }
    }

    //End Restricted Calendar
    //Start Prevent Leave obn Same Date
    var currentLeaves = getCurrentEmployeeLeaves(new Date($("#txtFromDate").val()), new Date($("#txtToDate").val()));
    if (currentLeaves.d.results.length > 0) {
        alert("Already Leave Applied");
        return false;
    }
    //End Prevent Leave On Same Date

    return true;
}


//bug: clubbing is not working 
//solution
function checkClubbingTab() {
    debugger;
    var clubbingData = new Object;
    clubbingData.leaveTypeId = selectedLeaveTypeId;

    // fetch data from leave configuration and prepare array to notClubWith
    var LeaveConfigObject = new Object();
    LeaveConfigObject.listName = "LeaveConfigurations";
    LeaveConfigObject.query = "$filter=ID eq '" + clubbingData.leaveTypeId + "'";
    var LeaveConfigData = getListItems(LeaveConfigObject).d.results;
    //    console.log(JSON.stringify(LeaveConfigData));
    for (var tempData = 0; tempData < LeaveConfigData[0].LeaveTypeNotToClubWithId.results.length; tempData++) {
        clubbingData.fromDate = new Date($("#txtFromDate").val()); // take from date
        clubbingData.toDate = new Date($("#txtToDate").val()); // take to date
        clubbingData.EmployeeAdNameId = _spPageContextInfo.userId; /// take employee ID    				
        clubbingData.leaveTypeId = LeaveConfigData[0].LeaveTypeNotToClubWithId.results[tempData];
        if (!checkClubbing(clubbingData)) {
            alert("You can not club this type of leave");
            //alert("Current leave is clashing with leave type Id : " + clubbingData.leaveTypeId);
            return false;
        }
    }
    return true;
}

function checkClubbing(clubbingData) {

    // check previous Day clubbing
    var checkCurrFromDate = clubbingData.fromDate;
    checkCurrFromDate.setDate(clubbingData.fromDate.getDate() - 1); // get previous Day of from Date.    
    checkCurrFromDate.setMonth(clubbingData.fromDate.getMonth() + 1); // get previous Day of from Date.        
    //    console.log("checkCurrFromDate : " + checkCurrFromDate);

    //tempDate will give you previously applied days which can not club with currently applied leaves
    var tempDate = checkCurrFromDate.getFullYear() + "-" + checkCurrFromDate.getMonth() + "-" + checkCurrFromDate.getDate();

    // fetch data from Leave Request List
    // EG: http://spserver:7000/sites/para/wings/_api/web/lists/getbytitle('LeaveRequests')/items?$filter=LeaveRequestToDate%20eq%20'2014-8-2' 
    var LeaveRequestObject = new Object();
    LeaveRequestObject.listName = "LeaveRequests";
    // working code    LeaveRequestObject.query = "$filter=LeaveRequestToDate eq '"+tempDate+"'";         	           
    LeaveRequestObject.query = "$filter=LeaveRequestToDate eq '" + tempDate + "' and EmployeeAdName eq '" + clubbingData.EmployeeAdNameId + "'and LeaveType eq '" + clubbingData.leaveTypeId + "'";

    var fetchData = getListItems(LeaveRequestObject);
    //    console.log(JSON.stringify(fetchData));

    // check the length of data if any data is fathed then we have to send false
    if (fetchData.d.results.length != 0) {
        //	alert(fetchData.d.results.length+" records Found");
        return false;
    }

    // check Past Day clubbing
    var checkCurrToDate = clubbingData.toDate;
    checkCurrToDate.setDate(clubbingData.toDate.getDate() + 1); // get previous Day of from Date.    
    checkCurrToDate.setMonth(clubbingData.toDate.getMonth() + 1); // get previous Day of from Date.        
    //    console.log("checkCurrFromDate : " + checkCurrToDate);
    var tempToDate = checkCurrToDate.getFullYear() + "-" + checkCurrToDate.getMonth() + "-" + checkCurrToDate.getDate();
    //    console.log("tempToDate : " + tempToDate);

    // fetch data from Leave Request List 	
    var LeaveRequestNewObject = new Object();
    LeaveRequestNewObject.listName = "LeaveRequests";
    LeaveRequestNewObject.query = "$filter=LeaveRequestFromDate eq '" + tempToDate + "'and EmployeeAdName eq '" + clubbingData.EmployeeAdNameId + "'and LeaveType eq '" + clubbingData.leaveTypeId + "'";

    var fetchNewData = getListItems(LeaveRequestNewObject);
    //    console.log(JSON.stringify(fetchNewData));

    // check the length of data if any data is fathed then we have to send false
    if (fetchNewData.d.results.length != 0) {
        //	alert(fetchNewData.d.results.length+" records Found");
        return false;
    }
    return true;
}

function getPendingDaysForApproval(PendingDaysData) {
    var LeaveRequestNewObject = new Object();
    LeaveRequestNewObject.listName = "LeaveRequests";
    LeaveRequestNewObject.query = "$filter=WorkflowStatus eq 'Pending'and EmployeeAdName eq '" + PendingDaysData.loginUserId + "'and LeaveType eq '" + PendingDaysData.leaveType + "'";

    var fetchNewData = getListItems(LeaveRequestNewObject).d.results;

    if (fetchNewData.length == 1) { // for single record
        return fetchNewData[0].NumberOfLeaves;
    } else { // for multiple record		
        var totalPendingLeave = 0;
        for (var tempVariable = 0; tempVariable < fetchNewData.length; tempVariable++) {
            totalPendingLeave = totalPendingLeave + fetchNewData[tempVariable].NumberOfLeaves;
        }
        return totalPendingLeave;
    }
    return 0;
}

function getEmployeeCalanderId(employeeId) {
    var employeeObject = new Object();
    employeeObject.listName = "BasicEmployeeDetails";
    employeeObject.query = "$filter=EmployeeAdName eq '" + employeeId + "'";
    return getListItems(employeeObject).d.results[0].CalendarLookupId;
}

function checkConsiderValidationsTab() {
    var LeaveConfigurationRecord = getLeaveConfigurationRecord(selectedLeaveTypeId).d.results[0]; // get Leave Configuration Settings    	    
    var holidayObject = new Object();
    holidayObject.employeeCalanderId = getEmployeeCalanderId(_spPageContextInfo.userId); // Get Employee Calander Id
    holidayObject.toDate = new Date($("#txtToDate").val());
    holidayObject.fromDate = new Date($("#txtFromDate").val());

    /* Start Check Intevening Holidays */
    var interveningHolidays = getInterveningHolidays(new Object(holidayObject));
    if (interveningHolidays != null) {
        if (LeaveConfigurationRecord.InterveningHolidays == "Yes") {
            alert(interveningHolidays.length + " intervening holiday i.e[" + interveningHolidays + "] will be deducted from your leaves");
        }
    }
    /* Stop Check Intevening Holidays */

    /* Start check Intervening Weekly Offs */
    var interveningWeeklyOffs = getInterveningWeeklyOffs(new Object(holidayObject));
    if (interveningWeeklyOffs != "") {
        if (LeaveConfigurationRecord.InterveningHolidays == "Yes") {
            alert(interveningWeeklyOffs.length + " intervening Weekly Offs i.e[" + interveningWeeklyOffs + "] will be deducted from your leaves");
        }
    }
    /* Stop check Intervening Weekly Offs */

    /*Start Ckeck Prefix Holiday*/
    var prefixHolidayArray = getPrefixHolidays(holidayObject);

    if (prefixHolidayArray != "") { // check only if there are any prefix holidays.
        if (LeaveConfigurationRecord.PrefixHoliday == "Yes") {
            if (LeaveConfigurationRecord.PrefixHolidayIfYes == "Only the leave days") {} else if (LeaveConfigurationRecord.PrefixHolidayIfYes == "Leave day + 1 day Holiday") {
                alert(prefixHolidayArray[0] + " will also be considered as leave ");
            } else if (LeaveConfigurationRecord.PrefixHolidayIfYes == "Leave day + Entire Holiday") {

                if (prefixHolidayArray.length > 1) {
                    alert("from : " + prefixHolidayArray[0] + " To : " + prefixHolidayArray[prefixHolidayArray.length - 1] + " will also be considered as leave ");
                } else {
                    alert(prefixHolidayArray[0] + " will also be considered as leave ");
                }
            }
        } else {
            alert("Leave Before Holiday is not allowed");
            return false;
        }
    }
    /*Stop Ckeck Prefix Holiday*/

    /*Start Ckeck Suffix Holiday*/
    var suffixHolidayArray = getSuffixHolidays(holidayObject);

    if (suffixHolidayArray != "") { // check only if there are any Suffix holidays.
        if (LeaveConfigurationRecord.SuffixHoliday == "Yes") {
            if (LeaveConfigurationRecord.SuffixHolidayIfYes == "Only the leave days") {} else if (LeaveConfigurationRecord.SuffixHolidayIfYes == "Leave day + 1 day Holiday") {
                alert(suffixHolidayArray[0] + " will also be considered as leave ");
            } else if (LeaveConfigurationRecord.SuffixHolidayIfYes == "Leave day + Entire Holiday") {

                if (suffixHolidayArray.length > 1) {
                    alert("from : " + suffixHolidayArray[suffixHolidayArray.length - 1] + " To : " + suffixHolidayArray[0] + " will also be considered as leave ");
                } else {
                    alert(suffixHolidayArray[0] + " will also be considered as leave ");
                }
            }
        } else {
            alert("Leave after Holiday is not allowed");
            return false;
        }
    }
    /*Stop Ckeck Suffix Holiday*/

    var weeklyOffObject = new Object();
    weeklyOffObject.employeeCalanderId = getEmployeeCalanderId(_spPageContextInfo.userId); // Get Employee Calander Id
    weeklyOffObject.toDate = new Date($("#txtToDate").val());
    weeklyOffObject.fromDate = new Date($("#txtFromDate").val());

    /*Start Ckeck Prefix Weekly-Offs*/
    var prefixWeeklyOffsArray = getPrefixWeeklyOffs(weeklyOffObject);

    if (prefixWeeklyOffsArray != "") { // check only if there are any Suffix holidays.	      
        if (LeaveConfigurationRecord.PrefixWeeklyOffs == "Yes") {
            if (LeaveConfigurationRecord.PrefixWeeklyOffsIfYes == "Only the leave days") {} else if (LeaveConfigurationRecord.PrefixWeeklyOffsIfYes == "Leave day + 1 day WeeklyOff") {
                alert(prefixWeeklyOffsArray[0] + " will also be considered as leave ");
            } else if (LeaveConfigurationRecord.PrefixWeeklyOffsIfYes == "Leave day + Whole week off") {
                if (prefixWeeklyOffsArray.length > 1) {
                    alert("from : " + prefixWeeklyOffsArray[0] + " To : " + prefixWeeklyOffsArray[prefixWeeklyOffsArray.length - 1] + " will also be considered as leave ");
                } else {
                    alert(prefixWeeklyOffsArray[0] + " will also be considered as leave ");
                }
            }
        } else {
            alert("Leave before WeeklyOff is not allowed");
            return false;
        }
    }
    /*Stop Ckeck Prefix Weekly-Offs*/

    /*Start Ckeck Suffix Weekly-Offs*/
    var suffixWeeklyOffsArray = getSuffixWeeklyOffs(weeklyOffObject);

    if (suffixWeeklyOffsArray != "") { // check only if there are any Suffix holidays.	        
        if (LeaveConfigurationRecord.SuffixWeeklyOffs == "Yes") {
            if (LeaveConfigurationRecord.SuffixWeeklyOffsIfYes == "Only the leave days") {} else if (LeaveConfigurationRecord.SuffixWeeklyOffsIfYes == "Leave day + 1 day WeeklyOff") {
                alert(suffixWeeklyOffsArray[0] + " will also be considered as leave ");
            } else if (LeaveConfigurationRecord.SuffixWeeklyOffsIfYes == "Leave day + Whole week off") {
                if (suffixWeeklyOffsArray.length > 1) {
                    alert("from : " + suffixWeeklyOffsArray[suffixWeeklyOffsArray.length - 1] + " To : " + suffixWeeklyOffsArray[0] + " will also be considered as leave ");
                } else {
                    alert(suffixWeeklyOffsArray[0] + " will also be considered as leave ");
                }
            }
        } else {
            alert("Leave after WeeklyOff is not allowed");
            return false;
        }
    }
    /*Stop Ckeck Suffix Weekly-Offs*/
    return true;
    /*Stop Consider Validation */
}

function getPrefixHolidays(prefixHolidayObject) {
    var getPrefixHoliday, holidayArray = [];
    prefixHolidayObject.toDate.setDate(prefixHolidayObject.toDate.getDate() + 1); // set one day after to date to compare hoilday on that Day 
    prefixHolidayObject.toDate.setMonth(prefixHolidayObject.toDate.getMonth() + 1);

    for (;
    (getPrefixHoliday = getLinkingPrefixHolidays(prefixHolidayObject)) != null;) {
        holidayArray.push(getPrefixHoliday);
        prefixHolidayObject.toDate.setDate(prefixHolidayObject.toDate.getDate() + 1); // set one day after to date to compare hoilday on that Day 
    }
    return holidayArray;

    function getLinkingPrefixHolidays(newPrefixHolidayObject) {
        var newDateToCompare = newPrefixHolidayObject.toDate.getFullYear() + "-" + newPrefixHolidayObject.toDate.getMonth() + "-" + newPrefixHolidayObject.toDate.getDate();
        //        console.log("tempToDate : " + newDateToCompare);

        var newHolidayObject = new Object();
        newHolidayObject.listName = "Holidays";
        newHolidayObject.query = "$filter=CalendarLookup eq '" + prefixHolidayObject.employeeCalanderId + "' and GraduationDate eq '" + newDateToCompare + "'";
        var getNewPrefixHolidayData = getListItems(newHolidayObject).d.results;

        if (getNewPrefixHolidayData == "") {
            return null;
        } else {
            return new Date(getNewPrefixHolidayData[0].GraduationDate);
        }
    }
}

function getSuffixHolidays(suffixHolidayObject) {
    var getSuffixHoliday, holidayArray = [];
    suffixHolidayObject.fromDate.setDate(suffixHolidayObject.fromDate.getDate() - 1); // set one day before to date to compare hoilday on that Day 
    suffixHolidayObject.fromDate.setMonth(suffixHolidayObject.fromDate.getMonth() + 1);

    for (;
    (getSuffixHoliday = getLinkingSuffixHolidays(suffixHolidayObject)) != null;) {
        holidayArray.push(getSuffixHoliday);
        suffixHolidayObject.fromDate.setDate(suffixHolidayObject.fromDate.getDate() - 1); // set one day before to date to compare hoilday on that Day 
    }
    return holidayArray;

    function getLinkingSuffixHolidays(newSuffixHolidayObject) {
        var newDateToCompare = newSuffixHolidayObject.fromDate.getFullYear() + "-" + newSuffixHolidayObject.fromDate.getMonth() + "-" + newSuffixHolidayObject.fromDate.getDate();
        //        console.log("tempToDate : " + newDateToCompare);

        var newHolidayObject = new Object();
        newHolidayObject.listName = "Holidays";
        newHolidayObject.query = "$filter=CalendarLookup eq '" + newSuffixHolidayObject.employeeCalanderId + "' and GraduationDate eq '" + newDateToCompare + "'";
        var getNewSuffixHolidayData = getListItems(newHolidayObject).d.results;

        if (getNewSuffixHolidayData == "") {
            return null;
        } else {
            return new Date(getNewSuffixHolidayData[0].GraduationDate);
        }
    }
}

function getPrefixWeeklyOffs(prefixWeeklyOffObject) {
    var WeeklyOffArray = [];
    var InterveningWeeklyOffArray = [];

    var dateObject = new Object();
    dateObject.fromDate = new Date(prefixWeeklyOffObject.fromDate);
    dateObject.toDate = new Date(prefixWeeklyOffObject.toDate);
    var rangeOfMonths = getPrefixMonthsForGivenDateRange(dateObject);

    for (var tempVar = 0; tempVar < rangeOfMonths.length; tempVar++) {

        var newObject = new Object();
        newObject.month = rangeOfMonths[tempVar].month;
        newObject.year = rangeOfMonths[tempVar].year;
        newObject.calanderId = prefixWeeklyOffObject.employeeCalanderId;

        var listOfWeeklyOffs = getWeeklyOffsforGivenMonth(newObject);

        for (var tempVar1 = 0; tempVar1 < listOfWeeklyOffs.length; tempVar1++) {
            WeeklyOffArray[WeeklyOffArray.length] = listOfWeeklyOffs[tempVar1];
        }
    }

    var getPrefixWeeklyOffs, prefixWeeklyOffsArray = [];

    prefixWeeklyOffObject.toDate.setDate(prefixWeeklyOffObject.toDate.getDate() + 1); // set one day after to date to compare hoilday on that Day 

    for (;
    (getPrefixWeeklyOffs = getLinkingPrefixWeeklyOffs(prefixWeeklyOffObject.toDate)) != null;) {
        prefixWeeklyOffsArray.push(new Date(getPrefixWeeklyOffs));
        prefixWeeklyOffObject.toDate.setDate(prefixWeeklyOffObject.toDate.getDate() + 1); // set one day after to date to compare hoilday on that Day 
    }
    return prefixWeeklyOffsArray;

    function getLinkingPrefixWeeklyOffs(newDate) {
        for (var tempVar = 0; tempVar < WeeklyOffArray.length; tempVar++) {
            if (WeeklyOffArray[tempVar].toJSON() == newDate.toJSON()) {
                return new Date(newDate);
            }
        }
        return null;
    }
}

function getSuffixWeeklyOffs(suffixWeeklyOffObject) {
    var WeeklyOffArray = [];
    var InterveningWeeklyOffArray = [];

    var dateObject = new Object();
    dateObject.fromDate = new Date(suffixWeeklyOffObject.fromDate);
    dateObject.toDate = new Date(suffixWeeklyOffObject.toDate);
    var rangeOfMonths = getSuffixMonthsForGivenDateRange(dateObject);

    for (var tempVar = 0; tempVar < rangeOfMonths.length; tempVar++) {

        var newObject = new Object();
        newObject.month = rangeOfMonths[tempVar].month;
        newObject.year = rangeOfMonths[tempVar].year;
        newObject.calanderId = suffixWeeklyOffObject.employeeCalanderId;

        var listOfWeeklyOffs = getWeeklyOffsforGivenMonth(newObject);

        for (var tempVar1 = 0; tempVar1 < listOfWeeklyOffs.length; tempVar1++) {
            WeeklyOffArray[WeeklyOffArray.length] = listOfWeeklyOffs[tempVar1];
        }
    }

    var getSuffixWeeklyOffs, suffixWeeklyOffsArray = [];

    suffixWeeklyOffObject.fromDate.setDate(suffixWeeklyOffObject.fromDate.getDate() - 1); // set one day after to date to compare hoilday on that Day 

    for (;
    (getSuffixWeeklyOffs = getLinkingSuffixWeeklyOffs(suffixWeeklyOffObject.fromDate)) != null;) {
        suffixWeeklyOffsArray.push(new Date(getSuffixWeeklyOffs));
        suffixWeeklyOffObject.fromDate.setDate(suffixWeeklyOffObject.fromDate.getDate() - 1); // set one day after to date to compare hoilday on that Day 
    }
    return suffixWeeklyOffsArray;

    function getLinkingSuffixWeeklyOffs(newDate) {
        for (var tempVar = 0; tempVar < WeeklyOffArray.length; tempVar++) {
            if (WeeklyOffArray[tempVar].toJSON() == newDate.toJSON()) {
                return new Date(newDate);
            }
        }
        return null;
    }
}

function getWeeklyOffsforCurrentMonth(calanderId) {
    var weeklyOffsArray = [];
    var newWeeklyOffObject = new Object();
    newWeeklyOffObject.listName = "weeklyoffs";
    newWeeklyOffObject.query = "$filter=CalendarLookup eq '" + calanderId + "'";
    var WeeklyOffsSettingsData = getListItems(newWeeklyOffObject).d.results;

    for (var tempVariable = 0; tempVariable < WeeklyOffsSettingsData.length; tempVariable++) {
        var currWeeklyOfsArray = getWeeklyOff(WeeklyOffsSettingsData[tempVariable]);

        if (currWeeklyOfsArray != null && currWeeklyOfsArray.length == undefined) { //if single date is retrived
            weeklyOffsArray.push(new Date(currWeeklyOfsArray));
        } else { // if multiple dates are retrived
            for (var tempVar1 = 0; tempVar1 < currWeeklyOfsArray.length; tempVar1++) {
                weeklyOffsArray[weeklyOffsArray.length] = currWeeklyOfsArray[tempVar1];
            }
        }
    }
    weeklyOffsArray.sort();
    return weeklyOffsArray;

    function getWeeklyOff(weekConfigObject) {
        var weekDay = getWeekDayNumber(weekConfigObject.DayOftheWeek);

        var date = new Date();
        var monthStartDate = new Date(date.getFullYear(), date.getMonth(), 1);
        var monthEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        switch (weekConfigObject.WeekNumber) {
            case "All":
                var weekOffs = [];
                for (var tempDate = monthStartDate; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        weekOffs.push(new Date(tempDate));
                    }
                }
                return weekOffs;
                break;
            case "First Week":
                var flag = 1;
                for (var tempDate = monthStartDate, tempVar = 0; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        tempVar++;
                        if (flag == tempVar) {
                            return (new Date(tempDate));
                        }
                    }
                }
                break;
            case "Second Week":
                var flag = 2;
                for (var tempDate = monthStartDate, tempVar = 0; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        tempVar++;
                        if (flag == tempVar) {
                            return (new Date(tempDate));
                        }
                    }
                }
                break;
            case "Third Week":
                var flag = 3;
                for (var tempDate = monthStartDate, tempVar = 0; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        tempVar++;
                        if (flag == tempVar) {
                            return (new Date(tempDate));
                        }
                    }
                }
                break;
            case "Fourth Week":
                var flag = 4;
                for (var tempDate = monthStartDate, tempVar = 0; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        tempVar++;
                        if (flag == tempVar) {
                            return (new Date(tempDate));
                        }
                    }
                }
                break;
            case "Fifth Week":
                var flag = 5;
                for (var tempDate = monthStartDate, tempVar = 0; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        tempVar++;
                        if (flag == tempVar) {
                            return (new Date(tempDate));
                        }
                    }
                }
                break;
        }
        return null;
    }

    function getWeekDayNumber(weekDay) {
        switch (weekDay) {
            case "Sunday":
                return 0;
            case "Monday":
                return 1;
            case "Tuesday":
                return 2;
            case "Wednesday":
                return 3;
            case "Thursday":
                return 4;
            case "Friday":
                return 5;
            case "Saturday":
                return 6;
        }
    }
}

/* function to get list of holidays for the given range of dates

input:
object passes to this function should contain 3 paramaters "
.employeeCalanderId : should contain calander ID 
.fromDate : should contain from date 
.toDate : should contain to date 

returns:
array of holiday dates for the specified calander in the given date range or it will return null
*/
function getInterveningHolidays(holidayObject) {
    var holidayArray = [];
    var newHolidayObject = new Object();
    newHolidayObject.listName = "Holidays";
    newHolidayObject.query = "$filter=CalendarLookup eq '" + holidayObject.employeeCalanderId + "' and GraduationDate ge '" + holidayObject.fromDate.format("yyyy-MM-dd") + "' and GraduationDate le '" + holidayObject.toDate.format("yyyy-MM-dd") + "'";
    var thisMonthHolidayList = getListItems(newHolidayObject).d.results;

    if (thisMonthHolidayList.length == 0) {
        return null;
    }
    for (var holidayCount = 0; holidayCount < thisMonthHolidayList.length; holidayCount++) {
        holidayArray.push(new Date(thisMonthHolidayList[holidayCount].GraduationDate));
    }
    return holidayArray;
}

/* function to get list of weekly for the given range of dates

input:
object passes to this function should contain 3 paramaters "
.employeeCalanderId : should contain calander ID 
.fromDate : should contain from date 
.toDate : should contain to date 

returns:
array of WeeklyOffs dates for the specified calander in the given date range or it will return null
*/
function getInterveningWeeklyOffs(WeeklyOffObject) {
    var WeeklyOffArray = [];
    var InterveningWeeklyOffArray = [];

    var dateObject = new Object();
    dateObject.fromDate = new Date(WeeklyOffObject.fromDate);
    dateObject.toDate = new Date(WeeklyOffObject.toDate);
    var rangeOfMonths = getMonthsForGivenDateRange(dateObject);

    for (var tempVar = 0; tempVar < rangeOfMonths.length; tempVar++) {

        var newObject = new Object();
        newObject.month = rangeOfMonths[tempVar].month;
        newObject.year = rangeOfMonths[tempVar].year;
        newObject.calanderId = WeeklyOffObject.employeeCalanderId;

        var listOfWeeklyOffs = getWeeklyOffsforGivenMonth(newObject);

        for (var tempVar1 = 0; tempVar1 < listOfWeeklyOffs.length; tempVar1++) {
            WeeklyOffArray[WeeklyOffArray.length] = listOfWeeklyOffs[tempVar1];
        }
    }

    for (var tempVariable = 0; tempVariable < WeeklyOffArray.length; tempVariable++) {
        if (WeeklyOffArray[tempVariable] >= WeeklyOffObject.fromDate && WeeklyOffArray[tempVariable] <= WeeklyOffObject.toDate) {
            InterveningWeeklyOffArray[InterveningWeeklyOffArray.length] = WeeklyOffArray[tempVariable];
        }
    }

    return InterveningWeeklyOffArray;
}

function formValidation() {
    var flag = 0;

    // remove red-outline from all input elements.
    $(".field-group input,.field-group select").each(function () {
        if ($(this).hasClass("red-outline")) {
            $(this).removeClass("red-outline");
        }
    });

    if (($("#txtFromDate").val() == "")) { //check for null
        $("#txtFromDate").addClass("red-outline");
        flag = 1;
    }

    if (($("#txtToDate").val() == "")) { //check for null
        $("#txtToDate").addClass("red-outline");
        flag = 1;
    }

    if (($("#txtReason").val() == "")) { //check for null
        $("#txtReason").addClass("red-outline");
        flag = 1;
    }

    if (flag == 0) {
        return true;
    }
    alert("Please Enter required Fields");
    return false;
}

/*
getWeeklyOffsforGivenMonth is used to get list of weekly Off for the given month

Input: object with 3 paramaters
object.month (i.e from 0(Jan) to 11(Dec) )
object.year (full year (Eg. 2014))
object.calanderId (The Calander If for which Weekly offs should be fetched)

Output: Object which contails Array of WeeklyOffss for the given month, year and calanderId.
*/
function getWeeklyOffsforGivenMonth(WeeklyOffObject) {
    var weeklyOffsArray = [];
    var newWeeklyOffObject = new Object();

    newWeeklyOffObject.listName = "weeklyoffs";
    newWeeklyOffObject.query = "$filter=CalendarLookup eq '" + WeeklyOffObject.calanderId + "'";
    var WeeklyOffsSettingsData = getListItems(newWeeklyOffObject).d.results;

    for (var tempVariable = 0; tempVariable < WeeklyOffsSettingsData.length; tempVariable++) {
        var currWeeklyOfsArray = getWeeklyOff(WeeklyOffsSettingsData[tempVariable]);

        if (currWeeklyOfsArray != null && currWeeklyOfsArray.length == undefined) { //if single date is retrived
            weeklyOffsArray.push(new Date(currWeeklyOfsArray));
        } else { // if multiple dates are retrived
            for (var tempVar1 = 0; tempVar1 < currWeeklyOfsArray.length; tempVar1++) {
                weeklyOffsArray[weeklyOffsArray.length] = currWeeklyOfsArray[tempVar1];
            }
        }
    }
    weeklyOffsArray.sort();
    return weeklyOffsArray;

    function getWeeklyOff(weekConfigObject) {
        var weekDay = getWeekDayNumber(weekConfigObject.DayOftheWeek);

        var date = new Date();
        var monthStartDate = new Date(WeeklyOffObject.year, WeeklyOffObject.month, 1);
        var monthEndDate = new Date(WeeklyOffObject.year, WeeklyOffObject.month + 1, 0);

        switch (weekConfigObject.WeekNumber) {
            case "All":
                var weekOffs = [];
                for (var tempDate = monthStartDate; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        weekOffs.push(new Date(tempDate));
                    }
                }
                return weekOffs;
                break;
            case "First Week":
                var flag = 1;
                for (var tempDate = monthStartDate, tempVar = 0; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        tempVar++;
                        if (flag == tempVar) {
                            return (new Date(tempDate));
                        }
                    }
                }
                break;
            case "Second Week":
                var flag = 2;
                for (var tempDate = monthStartDate, tempVar = 0; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        tempVar++;
                        if (flag == tempVar) {
                            return (new Date(tempDate));
                        }
                    }
                }
                break;
            case "Third Week":
                var flag = 3;
                for (var tempDate = monthStartDate, tempVar = 0; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        tempVar++;
                        if (flag == tempVar) {
                            return (new Date(tempDate));
                        }
                    }
                }
                break;
            case "Fourth Week":
                var flag = 4;
                for (var tempDate = monthStartDate, tempVar = 0; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        tempVar++;
                        if (flag == tempVar) {
                            return (new Date(tempDate));
                        }
                    }
                }
                break;
            case "Fifth Week":
                var flag = 5;
                for (var tempDate = monthStartDate, tempVar = 0; tempDate <= monthEndDate; tempDate.setDate(tempDate.getDate() + 1)) {
                    if (tempDate.getDay() == weekDay) {
                        tempVar++;
                        if (flag == tempVar) {
                            return (new Date(tempDate));
                        }
                    }
                }
                break;
        }
        return null;
    }

    function getWeekDayNumber(weekDay) {
        switch (weekDay) {
            case "Sunday":
                return 0;
            case "Monday":
                return 1;
            case "Tuesday":
                return 2;
            case "Wednesday":
                return 3;
            case "Thursday":
                return 4;
            case "Friday":
                return 5;
            case "Saturday":
                return 6;
        }
    }
}

/*
getMonthsForGivenDateRange function will return months for the Date range

Input: object with 2 paramaters
object.fromDate
object.fromDate

output: it will return JSON with month and year

eg: 
input:
fromDate : 31th July 2014 
toDate : 2nd Aug 2014

output:
"[{"month":6,"year":2014},{"month":7,"year":2014}]"

*/
function getMonthsForGivenDateRange(DateObject) {
    var returnObject = [];
    DateObject.fromDate.setDate(1);
    DateObject.toDate.setDate(1)

    for (; DateObject.fromDate <= DateObject.toDate;) {

        var tempObject = new Object();
        tempObject.month = DateObject.fromDate.getMonth();
        tempObject.year = DateObject.fromDate.getFullYear();

        //push tempObject in final returnObject.
        returnObject.push(tempObject);

        DateObject.fromDate.setMonth(DateObject.fromDate.getMonth() + 1);
    }
    return returnObject;
}

/*
getPrefixMonthsForGivenDateRange function will return prefix months for the Date range

Input: object with 2 paramaters
object.fromDate
object.fromDate

output: it will return JSON with month and year

eg: 
input:
fromDate : 31th July 2014 
toDate : 2nd Aug 2014

output:
"[{"month":5,"year":2014},{"month":6,"year":2014}]"

*/
function getPrefixMonthsForGivenDateRange(DateObject) {
    var returnObject = [];

    DateObject.toDate.setDate(1);
    DateObject.toDate.setMonth(DateObject.toDate.getMonth() - 1);

    var newObject = new Object();
    newObject.month = DateObject.toDate.getMonth();
    newObject.year = DateObject.toDate.getFullYear();
    returnObject.push(newObject); //push tempObject in final returnObject.

    var newObject1 = new Object();
    DateObject.toDate.setMonth(DateObject.toDate.getMonth() + 1);
    newObject1.month = DateObject.toDate.getMonth();
    newObject1.year = DateObject.toDate.getFullYear();
    returnObject.push(newObject1); //push tempObject in final returnObject.

    return returnObject;
}

/*
getSuffixMonthsForGivenDateRange function will return Suffix months for the Date range

Input: object with 2 paramaters
object.fromDate
object.fromDate

output: it will return JSON with month and year

eg: 
input:
fromDate : 31th July 2014 
toDate : 2nd Aug 2014

output:
"[{"month":7,"year":2014},{"month":8,"year":2014}]"

*/
function getSuffixMonthsForGivenDateRange(DateObject) {
    var returnObject = [];
    DateObject.fromDate.setDate(1);

    var newObject = new Object();
    newObject.month = DateObject.fromDate.getMonth();
    newObject.year = DateObject.fromDate.getFullYear();
    returnObject.push(newObject); //push tempObject in final returnObject.

    var newObject1 = new Object();
    DateObject.fromDate.setMonth(DateObject.fromDate.getMonth() + 1);
    newObject1.month = DateObject.fromDate.getMonth();
    newObject1.year = DateObject.fromDate.getFullYear();
    returnObject.push(newObject1); //push tempObject in final returnObject.

    return returnObject;
}
