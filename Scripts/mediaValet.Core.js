/*!
 * MediaValet v0.0.1
 * Copyright 2015-2016 MediaValet. 
 */
//check jQuery dependencies
if (typeof jQuery === 'undefined') {
    throw new Error('MediaValet\'s JavaScript requires jQuery');
}
// check jQuery version
+function ($) {
    'use strict';
    var version = $.fn.jquery.split(' ')[0].split('.');
    if ((version[0] < 1 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1)) {
        throw new Error('MediaValet\'s JavaScript requires jQuery version 1.9.1 or higher')
    }
}(jQuery);
+(function (source, $) {
    var apiEndpoints = {
        authenticate: "/authorization/token",
        assets: "/assets",
        recentupload: "/recentlyUploaded",
        mostviewed: "/mostViewed"
    };
    var defaultOptions = {
        ApiUrl: "https://api-test.mediavalet.net"
    };
    var isInitialized = false;
    var isAuthenticated = false;
    var accessToken = null;
    /* So what we gonna do for now. 
        1.  Login
        2.  Search
     */
    var mediaValet = function () {
        /**
   * initialize function
   * @param {options}  
   */
        mediaValet.prototype.initialize = function (options) {
            defaultOptions = $.extend({}, defaultOptions, options || {});
            if (options === true) {
                isInitialized = true;
            }
        }
        /**
         * SetCookies function
         * @param {cookiename} Cookiename 
         * @param {cookievalue} cookievalue 
         * @returns {expirydays} expirydays
         */
        mediaValet.prototype.SetCookies = function (cookiename, cookievalue, expirydays) {
            var d = new Date();
            d.setTime(d.getTime() + (expirydays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cookiename + "=" + cookievalue + "; " + expires;
        }
        /**
       * GetCookies function
       * @param {cookiename} Cookiename 
       * @returns {Cookies} cookies Values
       */
        mediaValet.prototype.GetCookies = function (cname) {
            if (cname != null) {
                var name = cname + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') c = c.substring(1);
                    if (c.indexOf(name) == 0)
                        return c.substring(name.length, c.length);
                }
            } else {
                return "";
            }
        }
        /**
        * authenticattion function
        * @param {UserName} userName 
        * @param {Password} password 
        * @param {URLAPI} Url API  
        * @param {function} errorCallback 
        * @returns {Object} Object,ErroMessage and Other Messages 
         * objectname.Token,objectname.RefreshToken,objectname.ExpiryToken,objectname.Message,objectname.ErrorMessages, 
        */
        mediaValet.prototype.authentication = function (username, password, urlapi) {
            var jsonObject = new Object();
            var authCallUrl = defaultOptions.ApiUrl + apiEndpoints.authenticate;
            $.ajax({
                url: authCallUrl,
                type: 'POST',
                async: false,
                data: { grant_type: "password", username: username, password: password },
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                success: function (data) {
                    jsonObject.data = data;
                    if (data.access_token != null) {
                        jsonObject.Token = data.access_token;
                        jsonObject.RefreshToken = data.refresh_token;
                        jsonObject.ExpiryToken = data.expires_in;
                        jsonObject.loginDate = Date.UTC();
                        mediaValet.prototype.SetCookies('urlapi', urlapi, 300);
                    } else {
                        jsonObject.Message = "please check your user name and password";
                    }
                },
                error: function () {
                    jsonObject.ErrorMessage = "please check your user name and password";
                }
            });
            return jsonObject;
        }

        mediaValet.prototype.RecentlyUploadedAsset = function (urlapi, setting, filter, token, offset, count) {
            // ?count=25&filters=(AssetType+EQ+Image)AND(Status+EQ+0)&offset=0
            var recentasseturl = defaultOptions.ApiUrl + apiEndpoints.recentupload;
            var seacrhingstr = '?count=' + count + '&filters=(AssetType+EQ+Image)AND(Status+EQ+0)&offset=' + offset;
            var jsonobject = new Object();
            $.ajax({
                type: 'GET',
                async: false,
                url: recentasseturl + seacrhingstr,
                dataType: 'json',
                contentType: 'application/json',
                headers: {
                    'Authorization': token
                },
                success: function (data) {
                    //console.log(data);
                    //var databind = '';
                    //var inc = 0;
                    //var payload = data.payload;
                    //var assets = payload.assets;
                    jsonobject.assets = data;
                },
                error: function () {
                    jsonobject.ErrorMessage = "please check your user name and password";
                }
            });
            return jsonobject;
        }
        /**
         * MostViewedAsset Funtion
         * @param {pass url to API} param 
         * @returns {} 
         */
        mediaValet.prototype.MostViwedAsset = function (urlapi, setting, filter, token, offset, count) {
            var jsonObject = new Object();
            //var t = dynapt.mediavalet.com;
            var recentasseturl = defaultOptions.ApiUrl + apiEndpoints.mostviewed;
            var seacrhingstr = '?count=' + count + '&filters=(AssetType+EQ+Image)AND(Status+EQ+0)&offset=' + offset;
            $.ajax({
                type: 'GET',
                async: false,
                url: recentasseturl + seacrhingstr,
                dataType: 'json',
                contentType: 'application/json',
                headers: {
                    'Authorization': token
                },
                success: function (data) {
                    var databind = '';
                    var inc = 0;
                    var payload = data.payload;
                    var assets = payload.assets;
                    jsonObject.assets = data;

                },
                error: function () {
                    jsonObject.ErrorMessage = "please check your user name and password";

                }
            });
            return jsonObject;
        }

        /**
         * NumberOfImageForInfiniteScroll Function
         * @param {DivID} DivID
         * @returns {ImageCouunt} 
         */
        mediaValet.prototype.NumberOfImageForInfiniteScroll = function (divid) {
            var count = 0;
            try {
                var divheight = $(divid).height();
                var rowcount = divheight / 100;
                var width = $(divid).width();
                var columncount = width / 100;
                count = parseInt(rowcount) * parseInt(columncount);
            } catch (ex) {
                count = ex;
            }
            return count;
        }
        /**
         * 
         * @param {} GetScreenResolutionDetails
         * @returns {ImageCouunt,DivHeight and Width to be set} 
         */
        mediaValet.prototype.NumberOfImagesToLoad = function (lodderdivid) {
            var imagecount = 0;
            try {
                var containerwidth = $(lodderdivid).width();
                // div height will be real cotianer height
                if (containerwidth > 1365) {
                    imagecount = '12';
                } else if (containerwidth > 1140 && containerwidth <= 1365) {
                    imagecount = '10';
                } else if (containerwidth > 915 && containerwidth <= 1140) {
                    imagecount = '8';
                } else if (containerwidth > 690 && containerwidth <= 915) {
                    imagecount = '6';
                }else if (containerwidth > 465 && containerwidth <= 690) {
                    imagecount = '4';
                } else if (containerwidth <= 465) {
                    imagecount = '3';
                }
            } catch (ex) {
                imagecount = ex;
            }
            return imagecount;
        }
        /**  
       Searching Criteria 
       */
        mediaValet.prototype.SearchingAssets = function (url, seacrhing, token, setting, filter, count, offset) {
            var jsonObject = new Object();
            try {
                var searchCallUrl = defaultOptions.ApiUrl + apiEndpoints.assets + "?search=" + seacrhing;
                if (defaultOptions.ApiUrl!==null) {
                    if (apiEndpoints.assets!==null) {
                        //var t = dynapt.mediavalet.com;
                        //var otherparam = '?count=' + count + '&filters=(AssetType+EQ+Image)AND(Status+EQ+0)&offset=' + offset;
                        var otherparam = '&count+eq+' + count + '&offset+eq+' + offset;
                        var searchingurl = searchCallUrl + otherparam;
                        $.ajax({
                            type: 'GET',
                            async: false,
                            url: searchingurl,
                            dataType: 'json',
                            contentType: 'application/json',
                            headers: {
                                'Authorization': token
                            },
                            success: function(data) {
                                jsonObject.assets = data;
                            },
                            error: function() {
                                jsonObject.ErrorMessage = "please check your user name and password";
                            }
                        });
                    } else {
                        jsonObject.errormessage = "Incorrect EndPoint";
                    }
                } else {
                    jsonObject.errormessage = "Incorrect Api Url";
                }
                return jsonObject;
            } catch (ex) {
                jsonObject.exception = ex;
            }
            return jsonObject;
        }

       
        /**
         * Validation Function
         * @param {textfieldvalue} textfieldvalue 
         * @returns {message} if Required value is not according to use else will return false 
         */
        mediaValet.prototype.Validation = function (inputtype, textfieldvalue) {
            var messages = '';
            if (inputtype.toLowerCase()=== 'text') {
                if (textfieldvalue.trim() != '') {
                    messages = '';
                } else {
                    messages = 'Please Enter value in textBox';
                }
            } else if (inputtype.toLowerCase() === 'url') {
                if (textfieldvalue.trim() != '') {
                    messages = '';
                } else { 
                    messages = 'Please Enter value in URL ' + inputtype + ' textBox';
                }
            } else if (inputtype.toLowerCase() === 'Email') {
                if (textfieldvalue.trim() != '') {
                    messages = '';
                } else {
                    messages = 'Please Enter value in User ' + inputtype + ' Email';
                }
            } else if (inputtype.toLowerCase() === 'Password') {
                if (textfieldvalue.trim() != '') {
                    messages = '';
                } else {
                    messages = 'Please Enter value in ' + inputtype + ' textbox';
                }
            }
            return messages;
        }
        mediaValet.prototype.CheckExtension = function (filename) {
            var images = '';
            var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
            if ($.inArray(filename.split('.').pop().toLowerCase(), fileExtension) === -1) {
                images = 'noimage';
            } else {
                images = filename;
            }
            return images;
        }


       
    };
    source.mvCore = new mediaValet();
    // ReSharper disable once ThisInGlobalContext
})(typeof window !== "undefined" ? window : this, jQuery);