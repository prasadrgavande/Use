using System;
using System.Security.Permissions;
using Microsoft.SharePoint;
using Microsoft.SharePoint.Utilities;
using Microsoft.SharePoint.Workflow;
using System.Text.RegularExpressions;

namespace EventReciever.Prasad.GradeEventReceiver
{
    /// <summary>
    /// List Item Events
    /// </summary>
    public class GradeEventReceiver : SPItemEventReceiver
    {
        /// <summary>
        /// An item is being added.
        /// </summary>
        /// 
        string message = string.Empty;
        int flag = 1;
        bool isValid = false;
        public override void ItemAdding(SPItemEventProperties properties)
        {
            base.ItemAdding(properties);
            checkDuplicateItems(properties);
            validate(properties);
        }

        /// <summary>
        /// An item is being updated.
        /// </summary>
        public override void ItemUpdating(SPItemEventProperties properties)
        {
            base.ItemUpdating(properties);
            checkDuplicateItems(properties);
            validate(properties);
        }

        /// <summary>
        /// An item is being deleted.
        /// </summary>
        public override void ItemDeleting(SPItemEventProperties properties)
        {
            base.ItemDeleting(properties);
            int gradeId = properties.ListItemId; 
            SPListItem currentItem = properties.ListItem;
            properties.Status = SPEventReceiverStatus.CancelNoError;
            currentItem["_Status"] = "Deleted";
            currentItem.Update();
            isValid = true;
        }
        /// <summary>
        /// following funciton will use to check validation with regular expression
        /// </summary>
        /// <param name="element">this is element to be validate</param>
        /// <param name="regularExp">this is regular expression which to be compaire</param>
        /// <returns>returns a bool value will return a true or false</returns>
        private bool IsValidRegExp(string element, string regularExp)
        {
            Regex regEx = new Regex(regularExp);
            isValid = regEx.IsMatch(element);
            return isValid;
        }
        /// <summary>
        /// Following function is use to validate 
        /// this will internally call the function IsValidRegExp(element, regularExp)
        /// which at the end will prevent the data to save
        /// and will show error message
        /// </summary>
        /// <param name="properties"></param>
        private void validate(SPItemEventProperties properties)
        {
            //take name if column to one string
            string nameString = properties.AfterProperties["Title"].ToString();
            //following if will check if the name string is null or not
            if (nameString == string.Empty)
            {
                message += "Name field can not be blank \n";
            }

       /*     string numericValidation = @"^\d*$";   //regular expression for numeric validation
            string numberString = properties.AfterProperties["number"].ToString();
            //check if number is valid or not
            if (!IsValidRegExp(numberString, numericValidation))
            {
                message += "Please Enter Number only \n";
                flag = 0;
            }

            string checkNameRange = @"^([a-zA-Z]{3,50})$";  //regular expression for range of name
            if (nameString != string.Empty)
            {
                if (!IsValidRegExp(nameString, checkNameRange))
                {
                    message += "Name field's charactor in between 3 and 50 \n";
                    flag = 0;
                }
            }
            string checkDescriptionRange = @"^([a-zA-Z]{3,250})$";    //regular expression for range of description
            string descriptionString = properties.AfterProperties["KpiDescription"].ToString();
            if (descriptionString != string.Empty)
            {
                if (!IsValidRegExp(descriptionString, checkDescriptionRange))
                {
                    message += "Description field's charactor in between 3 and 250 \n";
                    flag = 0;
                }
            }
            string checkHeirarchyRange = @"^([a-zA-Z]{3,250})$";    //regular expression for range of heirarchy
            string heirarchyString = properties.AfterProperties["Hierarchy"].ToString();
            if (heirarchyString != string.Empty)
            {
                if (!IsValidRegExp(heirarchyString, checkHeirarchyRange))
                {
                    message += "Heirarchy field's charactor in between 3 and 250 \n";
                    flag = 0;

                }
            } */
            if (flag == 0)
            {
                //set the status of the properties with CancelWithError
                properties.Status = SPEventReceiverStatus.CancelWithError;
                //Now prevent the data to be save
                properties.Cancel = true;
                //show error message
                properties.ErrorMessage = message;
            }
        }
        private void checkDuplicateItems(SPItemEventProperties properties)
        {
            if (properties.ListTitle.Equals("Grades"))
            {
                using (SPSite thisSite = new SPSite(properties.WebUrl))
                {
                    SPWeb thisweb = thisSite.OpenWeb();
                    SPList spList = thisweb.Lists[properties.ListTitle];
                    SPQuery query = new SPQuery();
                    query.Query = @"<Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" +
                                 properties.AfterProperties["Title"] + "</Value></Eq></Where>";
                    SPListItemCollection listItem = spList.GetItems(query);
                    if (listItem.Count > 0)
                    {
                        properties.Cancel = true;
                        properties.ErrorMessage = "The item exsists already in list!";
                    }
                }

            }
        }
    }
}
