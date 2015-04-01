$(document).on("click", "#btnSubmit", function () {
    if (formValidation()) {
        var itemId;
        var clubbingValidationOutCome = checkClubbingTab();
        if(clubbingValidationOutCome  == false){
        // if false then should not execute following code
            alert(clubbingValidationOutCome + " : clubbingValidationOutCome ");
	        return;
        }       

        var considerValidationOutcome = checkConsiderValidationsTab();
        if(considerValidationOutcome  == false){
 		// if false then should not execute following code
	        alert(considerValidationOutcome + " : considerValidationOutcome ");
	        return;
        }
        

        var commonTabValidationOutcome = commonTabValidation();
        if(commonTabValidationOutcome  == false){
        // if false then should not execute following code
	        alert(commonTabValidationOutcome + " : commonTabValidationOutcome ");
	        return false;
        }


        var listName = 'LeaveRequests';

        var dateObject = new Object();
        dateObject.fromDate = new Date($("#txtFromDate").val());
        dateObject.toDate = new Date($("#txtToDate").val());
        dateObject.fromType = $("input[name=FromType]:checked").val();
        dateObject.toType = $("input[name=ToType]:checked").val();

        var fieldData = [
                           ['LeaveTypeId', parseInt(selectedLeaveTypeId)],
                           ['LeaveRequestFromDate', $("#txtFromDate").val()],
                           ['LeaveRequestToDate', $("#txtToDate").val()],
                           ['LeaveFromType', $('input[name=FromType]').val()],
                           ['LeaveToType', $('input[name=ToType]').val()],
                           ['LeaveReason', $('#txtReason').val()],
                           ['CallbackNumber', $('#txtPhoneNo').val()],
                           ['EmployeeAdNameId', _spPageContextInfo.userId],
                           ['LeaveBalanceId', balanceListItemId],
                           ['WorkflowStatus', "Pending"],
                           ['NumberOfLeaves', DaysDifference(dateObject)]
        ];
        var listItemId = 0;
        var listDataObj = new listData(listName, fieldData, listItemId);

        if (clubbingValidationOutCome && considerValidationOutcome && commonTabValidationOutcome) {
            addListItem(listDataObj, function (data) {
                itemId = data.d.Id;
                //refreshListView();
                var body = JSON.stringify(body = {
                    "__metadata": { "type": "SP.Data.LeaveRequestsListItem" },
                    "EmployeesToBeNotifiedUsersId": {
                        "__metadata": {
                            "type": "Collection(Edm.Int32)"
                        },
                        "results": employeesToBeNotified
                    },
                    "HandoverWorkToUsersId": {
                        "__metadata": {
                            "type": "Collection(Edm.Int32)"
                        },
                        "results": employeesToWorkHandover
                    }
                });
                $.ajax({
                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('LeaveRequests')/items(" + JSON.stringify(data.d.Id) + ")",
                    type: "POST",
                    data: body,
                    async: false,
                    headers: {
                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                        "IF-MATCH": "*",
                        "X-HTTP-Method": "MERGE",
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose"
                    },
                    success: function (data) {
                        if ($("#FileSupportDocument").val() != "") {
                            uploadFile(itemId);
                        }

                        $('#main-section').unblock();
                        $("#DeltaPageStatusBar").css("display", "block");
                        successStatus("Leave request sent for approval");
                        closeModelDialog();
                        refreshListView();
                    },
                    error: function (data) {
                        //alert(JSON.stringify(data));
                        //alert("error");
                    }
                });

            }, function (err) {
                $("#DeltaPageStatusBar").css("display", "block");
                successStatus("Can Not Be Added");
                closeModelDialog();
                refreshListView();
            });
        }
        else {
            alert(" Validation Failed ");
        }

        function uploadFile(itemId) {
            var fileInput = $("#FileSupportDocument");
            var sFile = fileInput[0].files[0];
            // processUpload(sFile, itemId);
            var reader = new FileReader();
            reader.onload = function (event) {
                //var reader = event.target;
                // var arrayBuffer = reader.result;
                var fileData = '';
                var byteArray = new Uint8Array(event.target.result)
                for (var i = 0; i < byteArray.byteLength; i++) {
                    fileData += String.fromCharCode(byteArray[i])
                }
                //console.log(arrayBuffer.byteLength);
                var body = fileData;
                performUpload(body, itemId);
            };
            reader.readAsArrayBuffer(sFile);
        }


        // function processUpload(sFile, itemId) {
        //   debugger;
        // var input = event.target;

        //}

        function performUpload(body, itemId) {
            var fileNamePath = $("#FileSupportDocument").val();
            var fileName = fileNamePath.split('\\').pop();
            var composedUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('LeaveRequests')/items('" + itemId + "')/AttachmentFiles/add(FileName='" + fileName + "')";
            $.ajax({
                url: composedUrl,
                type: "POST",
                data: body,
                headers: {
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "content-length": body.length
                },
                success: function (data) {
                    alert("File added successfully");
                },
                error: function (err) {
                    alert("can not be added");
                    console.log(JSON.stringify(err));
                    alert(JSON.stringify(err));
                }
            });
        }
    }
});
