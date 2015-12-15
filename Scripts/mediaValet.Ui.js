/*!
 * MediaValet v0.0.1
 * Copyright 2015-2016 MediaValet. 
 */
//Check mvCore dependencies
+function ($, mvCore) {
    'use strict';
    if (typeof mvCore === "undefined") {
        throw new Error("MediaValetSdk Error: Media Valet Sdk Core is not loaded. First load Media Valet Core then load SDK.")
    }
}(jQuery, mvCore);
+function ($, source, mvCore) {
    'use strict';
    //Global variable
    var imagecounter = 0;
    var offsetcount = 0;

    //Paging variables
    var recentlyviewedoffset = 0;
    var recentlyviewedcount = 10;
    var mostviewedoffset = 0;
    var mostviewedcount = 10;

    //Create all basic emplate models
    var TemplateModel = {
        Loader: function (activity) {
            var loader = "<div id='mv-loader'><span></span><img src='images/loading-icon.gif'></div>";   //<h1>Loading.....</h1>
            if (activity === true)
                $('body').append(loader).show();
            else
                $('#mv-loader').remove();
        },
        Message: function (msg) {
            var message = '<div id="mv-message" style="background-color: rgba(255, 0, 0, 0.18); color:#000; width:300">' + msg + '</div>';
            $('body').append(message).show();
            setTimeout(function () {
                $('#mv-message').fadeOut().delay();
                setTimeout(function () { $('#mv-message').remove(); }, 1000);
            }, 4000);
        },
        LoginTemplate: function (options) {
            var defaults = {
                customText: 'Welcome'
            }
            defaults = options;
            var ui = '<div><div class="padding" style="background-color:skyblue;height:70px;top:0;position:absolute;width:100%"><h1 style="color:#fff;font-family:Time New Roman;">' + defaults.customText + '</h1></div></div>     <div id="content-main" style="margin-top:70px"><div class="padding"><table class="table table-reponsive"  style="font-size:15px"><tr><td>User Domain</td><td><input type="text" id="urltxt" placeholder="Enter URL" style="min-width:100px" value="https://api-test.mediavalet.net" /></td></tr><tr><td>User Name</td><td><input id="useremailtxt" value="philippeadmin@mediavalet.net" style="min-width:100px" /></td></tr> <tr><td>Password</td><td><input type="password" id="passwordtxt" value="1234test!" style="min-width:100px" /></td></tr><tr><td><input type="button" value="Login" id="mv-login"  /><td></td></tr></table> <p id="errormessage" class="errormessage"></p></div> <div>';
            return ui;
        },
        SearchTemplate: function (options) {
            var defaults = {
                customText: 'Welcome'
            }
            defaults = options;
            return '<div class="medialibraryMain" id="mycontainertestid"><div class="searchBox"> <input type="search"  placeholder="Search.." id="searchtxt" /><button class="search" id="searchbtn"><img src="images/search-icon.png"></button><button class="dots" id="menubtn" href="#modal"><img src="images/dots.png"></button><button class="settings" id="searchsettingsbtn"><img src="images/setting.png"></button><button class="edit"><img src="images/edit.png"></button><div class="menu1"><ol><li>Sort by Name</li><li>Sort by Date</li><li>About</li><li>Logout</li></ol></div><div class="menu2"><ol id="settingsolid"><li value="Original">Original</li><li value="Small">Small</li><li value="Medium">Medium</li><li  value="Large">Large</li></ol></div><div class="menu3"><ol><li>3.Menu1</li><li>3.Menu2</li><li>3.Menu3</li><li>3.Menu4</li></ol></div></div><div class="clear"></div><div class="medialibrary"><div class="clear"></div><p id="mediavaletlibraryparaid"></p><div class="contentBox" id="bindsearchdatadiv" ></div></div></div>';
        },
        RecentlyUploadedTemplate: function (options) {
            var defaults = {
                customText: 'Welcome'
            }
            defaults = options;
            return '<section class="ac-container"><div><input id="ac-1" name="accordion-1" checked type="checkbox"><label for="ac-1">Recently Uploaded</label><article class="ac-small"><div class="imageBox" id="recentlyuploadeddiv"></div></article></div></section>';
        },
        MostViewedTemplate: function (options) {
            var defaults = {
                customText: 'Welcome'
            }
            defaults = options;
            return '<section class="ac-container"><div><input id="ac-2" name="accordion-1" checked type="checkbox"><label for="ac-2">Most Viewed</label><article class="ac-small"><div class="imageBox" id="mostvieweddiv"></div></article></div></section>';
        }
        //,
        //ViewTemplate: function (options) {
        //    var defaults = {
        //        currentView: 'recentview',
        //        text:'Recently Uploaded'
        //    }
        //    var settings = $.extend({}, defaults, options);
        //    return '<section class="ac-container"><div><input id="ac-' + defaults.currentView + '" name="accordion-1" checked type="checkbox"><label for="ac-' + defaults.currentView + '">' + defaults.text + '</label><article class="ac-small"><div class="imageBox" id="' + defaults.currentView + '"></div></article></div></section>';
        //}
    };

    //Create basic model with all the basic events
    var Model = (function () {
        return {
            ShowLoader: function () {
                TemplateModel.Loader(true);
            },
            HideLoader: function () {
                TemplateModel.Loader(false);
            },
            Message: function (message) {
                return TemplateModel.Message(message);
            },
            LoginPanel: function (options) {
                return TemplateModel.LoginTemplate(options);
            },
            SearchPanel: function (options) {
                return TemplateModel.SearchTemplate(options);
            },
            RecentlyUploadedPanel: function (options) {
                return TemplateModel.RecentlyUploadedTemplate(options);
            },
            MostViewedPanel: function (options) {
                return TemplateModel.MostViewedTemplate(options);
            }
            //,
            //ViewPanel: function(options) {
            //    return TemplateModel.ViewTemplate(options);
            //}
        };
    })();
    var SearchingScreen = (function () {
        return {
            ImageLoading: function(asset, offset, categoryname) {
                var databind = '';
                var inc = offset;
                var payload = asset.assets.payload;
                /** 
                 Offset is 0 means image div loading
                 first time so it should be empty before going to
                 load all images into it
                */
                if (offset === 0) {
                    $('#bindsearchdatadiv').html('');
                }
                /**
                 * Binding all images fetched from API
                 */
                var assets = payload.assets;
                $(assets).each(function(index, alllinks) {
                    $(alllinks).each(function(k, medialinks) {
                        $(medialinks.media).each(function(index, links) {
                            inc++;
                            var large = 'noimage', small = 'noimage', original = 'noimage', thumbs = 'noimage', medium = 'noimage';
                            if (links.large !== 'undefined') {
                                large = mvCore.CheckExtension(links.large.trim());
                            }
                            if (links.small !== 'undefined') {
                                small = mvCore.CheckExtension(links.small.trim());
                            }
                            if (links.original !== 'undefined') {
                                original = mvCore.CheckExtension(links.original.trim());
                            }
                            if (links.thumb !== 'undefined') {
                                thumbs = mvCore.CheckExtension(links.thumb.trim());
                            }
                            if (links.medium !== 'undefined') {
                                medium = mvCore.CheckExtension(links.medium.trim());
                            }
                            var imagesmallhidden = categoryname+'imagesmallhidden' + inc;
                            var imagelargehidden = categoryname+'imagelargehidden' + inc;
                            var imagemediumhidden = categoryname+'imagemediumhidden' + inc;
                            var imageoriginalhidden = categoryname+'imageoriginalhidden' + inc;
                            var imagethumbhidden = categoryname+'imagethumbhidden' + inc;
                            var imagedivid = categoryname+'imagedivid' + inc;
                            var imageid = categoryname+'imgid' + inc;
                            databind = databind + '<div class="box" id="' + imagedivid + '"><img id="' + imageid + '" src="' + links.thumb + '"></div>';
                            var imgid = '#images' + inc;
                        });
                    });
                });
                if (inc === 0 && offset === 0) {
                    $('#bindsearchdatadiv').html('');
                    $('#bindsearchdatadiv').html('<h3 style="color:red;font-family:Times New Roman;">Your search did not match any documents.</h3>');
                } else {
                    $('#bindsearchdatadiv').append(databind);
                }
            }
        }
    })();
    var BindAsset = (function () {
        return {
            BindingAsset: function (divid, asset, category, btnid) {
            
                var databind = '';
                var inc = 0;
                var payload = asset.assets.payload;
                var assets = payload.assets;
                $(assets).each(function (index, alllinks) {
                    $(alllinks).each(function (k, medialinks) {
                        //console.log(medialinks)
                        $(medialinks.media).each(function (index, links) {
                            inc++;
                            //Counter helping us to create new image and event to perform futher task
                            imagecounter++;
                            var large = 'noimage', small = 'noimage', original = 'noimage', thumbs = 'noimage', medium = 'noimage';
                            if (links.large !== 'undefined') {
                                large = mvCore.CheckExtension(links.large.trim());
                            }
                            if (links.small !== 'undefined') {
                                small = mvCore.CheckExtension(links.small.trim());
                            }
                            if (links.original !== 'undefined') {
                                original = mvCore.CheckExtension(links.original.trim());
                            }
                            if (links.thumb !== 'undefined') {
                                thumbs = mvCore.CheckExtension(links.thumb.trim());
                            }
                            if (links.medium !== 'undefined') {
                                medium = mvCore.CheckExtension(links.medium.trim());
                            }
                            var imagesmallhidden = category + 'imagesmall' + imagecounter;
                            var imagelargehidden = category + 'imagelarge' + imagecounter;
                            var imagemediumhidden = category + 'imagemedium' + imagecounter;
                            var imageoriginalhidden = category + 'imageoriginal' + imagecounter;
                            var imagethumbhidden = category + 'imagethumb' + imagecounter;
                            var imagedivid = category + 'imagediv' + imagecounter;
                            var imageid = category + 'img' + imagecounter;
                            databind += '<div class="box" id="' + imagedivid + '"><img id="' + imageid + '" src="' + links.thumb + '"></div>';
                            var imgid = '#images' + imagecounter;
                        });
                    });

                });
                databind += '<div class="clearfix"></div><button id="' + btnid + '" class="dsMoreButton" >More</button>';

                if (inc === 0) {
                    $('#' + divid).html('');
                    $('#' + divid).html('<h3 style="color:red;font-family:Times New Roman;">Your search did not match any documents.</h3>');
                } else {
                    $('#' + divid).html('');
                    $('#' + divid).html(databind);
                }
          
    }
        }
    })();

    var Events = (function () {
        return {
            BindLoginEvent: function (option) {
                var message = '';
                $('#mv-login').bind({
                    click: function () {

                        //Checking Validation for given credentials
                        $('#errormessage').html('');
                        /*
                        Validation for entered credentials
                        */
                        if (mvCore.Validation("Email", $('#useremailtxt').val()) === '' && mvCore.Validation("password", $('#passwordtxt').val()) === '' && mvCore.Validation("Url", $('#urltxt').val()) === '') {
                            var data = mvCore.authentication($('#useremailtxt').val(), $('#passwordtxt').val(), $('#urltxt').val());
                            if (data.Token != null) {
                                message = 'success';
                                mvCore.SetCookies('cookiestkn', 'Bearer ' + data.Token, 300);
                                mvCore.SetCookies('urlapi', $('#urltxt').val(), 300);
                                mvCore.SetCookies('cookiesreftkn', data.RefreshToken, 300);
                                mvCore.SetCookies('cookiesrextkn', data.ExpiryToken, 300);
                                mvCore.SetCookies('cookiesrcreatedtkndate', data.loginDate, 300);
                                mvCore.SetCookies('settingofapp', 'medium', 300);
                                mvCore.SetCookies('filtersofapp', '', 300);

                                //Loading user's default page after successful login
                                $('#mvapp-container').SearchUI();
                            } else {
                                message = 'Incorrect login details';
                                $('#errormessage').html('Incorrect login details');
                            }
                        }
                        else {
                            message = 'Incorrect login details';
                            $('#errormessage').html('Incorrect login details.');
                        }

                    }
                });
                //return message;
                $(window).keypress(function (e, option) {
                    var code = e.keyCode || e.which;
                    if (code === 13) {
                        //Checking Validation for given credentials
                        $('#errormessage').html('');
                        /*
                        Validation for entered credentials
                        */
                        if (mvCore.Validation("Email", $('#useremailtxt').val()) === '' && mvCore.Validation("password", $('#passwordtxt').val()) === '' && mvCore.Validation("Url", $('#urltxt').val()) === '') {
                            var data = mvCore.authentication($('#useremailtxt').val(), $('#passwordtxt').val(), $('#urltxt').val());
                            if (data.Token != null) {
                                /**
                                 * If Login Success then Unbind Keypress Event for login
                                 */
                                $(window).unbind("keypress");
                                message = 'success';
                                mvCore.SetCookies('cookiestkn', 'Bearer ' + data.Token, 300);
                                mvCore.SetCookies('urlapi', $('#urltxt').val(), 300);
                                mvCore.SetCookies('cookiesreftkn', data.RefreshToken, 300);
                                mvCore.SetCookies('cookiesrextkn', data.ExpiryToken, 300);
                                mvCore.SetCookies('cookiesrcreatedtkndate', data.loginDate, 300);
                                mvCore.SetCookies('settingofapp', 'medium', 300);
                                mvCore.SetCookies('filtersofapp', '', 300);

                                //Loading user's default page after successful login
                                $('#mvapp-container').SearchUI();
                            } else {
                                message = 'Incorrect login details';
                                $('#errormessage').html('Incorrect login details');
                            }
                        }
                        else {
                            message = 'Incorrect login details';
                            $('#errormessage').html('Incorrect login details.');
                        }
                    }
                });
            },
            SearchingEvent: function (option) { 
                $('#searchbtn').bind({
                    click: function () {
                        var searchtext = $('#searchtxt').val();
                        var searchingimagecount = mvCore.NumberOfImageForInfiniteScroll('#bindsearchdatadiv');
                        //var searchingimageoffset = searchingimagecount;
                        var token = mvCore.GetCookies('cookiestkn');
                        var urlapi = mvCore.GetCookies('urlapi');
                        offsetcount = searchingimagecount;
                        var assets = mvCore.SearchingAssets(urlapi, searchtext, token, 'setting', 'filters', searchingimagecount, 0);
                        SearchingScreen.ImageLoading(assets, 0,'search');
                        /****
                        Event for scrolling when seaching done
                        ****/
                        $(window).scroll(function () {
                            if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                                var searchtext = $('#searchtxt').val();
                                //var searchingimageoffset = searchingimagecount;
                                var token = mvCore.GetCookies('cookiestkn');
                                var urlapi = mvCore.GetCookies('urlapi');
                                offsetcount = searchingimagecount;
                                var assets = mvCore.SearchingAssets(urlapi, searchtext, token, 'setting', 'filters', offsetcount, 10);
                                SearchingScreen.ImageLoading(assets, offsetcount,'search');
                                offsetcount = offsetcount + 10;
                            }
                        });
                    }
                });
                /*Binding here Enter Event*/
                $('#searchtxt').keypress(function (e) {
                    var code = e.keyCode || e.which;
                    if (code === 13) {
                        var searchtext = $('#searchtxt').val();
                        var searchingimagecount = mvCore.NumberOfImageForInfiniteScroll('#bindsearchdatadiv');
                        //var searchingimageoffset = searchingimagecount;
                        var token = mvCore.GetCookies('cookiestkn');
                        var urlapi = mvCore.GetCookies('urlapi');
                        offsetcount = searchingimagecount;
                        var assets = mvCore.SearchingAssets(urlapi, searchtext, token, 'setting', 'filters', searchingimagecount, 0);
                        SearchingScreen.ImageLoading(assets, 0,'search');
                        /**
                        Event for scrolling when seaching done
                        */
                        $(window).scroll(function () {
                            if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                                var searchtext = $('#searchtxt').val();

                                //var searchingimageoffset = searchingimagecount;

                                var token = mvCore.GetCookies('cookiestkn');
                                var urlapi = mvCore.GetCookies('urlapi');
                                offsetcount = searchingimagecount;
                                var assets = mvCore.SearchingAssets(urlapi, searchtext, token, 'setting', 'filters', offsetcount, 10);
                                SearchingScreen.ImageLoading(assets, offsetcount, 'search');
                                offsetcount = offsetcount + 10;
                            }
                        });
                    }
                });
            },
            RecentUploadedEvent: function (option) {
                var defaultImagecount = mvCore.NumberOfImagesToLoad('#bindsearchdatadiv');
                var recentviewasset = mvCore.RecentlyUploadedAsset(option.url, 'setting', 'filter', option.token, 0, defaultImagecount * 2);
                /**
                 Asset loading in recently uploaded images Accordian
                */
                BindAsset.BindingAsset('recentlyuploadeddiv', recentviewasset, 'recent', 'recentlyviewedmorebtn');
            },
            MostViewedEvent: function (option) {
                var defaultImagecount = mvCore.NumberOfImagesToLoad('#bindsearchdatadiv');
                var mostviewedasset = mvCore.MostViwedAsset(option.url, 'setting', 'filter', option.token, 0, defaultImagecount * 2);
                /**
                 Asset Loading In most viewed images Accordian
                */
                BindAsset.BindingAsset('mostvieweddiv', mostviewedasset, 'mostview', 'mostviewedmorebtn');
            },
            RecentUploadedMoreEvent: function (option) {
                $('#recentlyviewedmorebtn').bind({
                        click: function() {
                            $('#mediavaletlibraryparaid').html('');
                            $('#mediavaletlibraryparaid').html('<button style="background: none !important; font: inherit; margin: 10px; padding: 0px !important; border: currentColor; border-image: none; color: rgb(39, 38, 17); cursor: pointer; font-size-adjust: inherit; font-stretch: inherit;" id="mediavaletlibraryparbtn">Media Library</button><img src="images/arrow_right.png" /><label>Recently Uploaded</label>');
                            
                            var count = mvCore.NumberOfImageForInfiniteScroll('#bindsearchdatadiv');
                            recentlyviewedoffset = count;
                            recentlyviewedcount = 0;
                            var recentlyviwed = mvCore.RecentlyUploadedAsset(option.url, 'medium', 'filter', option.token, 0, count);
                            SearchingScreen.ImageLoading(recentlyviwed, 0,'recentview');
                            $(window).scroll(function () {
                                if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                                    recentlyviewedcount = 10;
                                      var recentlyviwed = mvCore.RecentlyUploadedAsset(option.url, 'medium', 'filter', option.token, recentlyviewedoffset, recentlyviewedcount);
                                       SearchingScreen.ImageLoading(recentlyviwed, recentlyviewedoffset,'recentview');
                                       recentlyviewedoffset = recentlyviewedoffset + recentlyviewedcount;
                                }
                            });
                            /* 
                              Binding Here Event for MediaValet  to load default view
                            */
                            $("#mediavaletlibraryparbtn").on("click", function () {
                               window.location.reload();
                            });
                        }
                });
               
            },
            MostViewedMoreEvent: function (option) {
                $('#mostviewedmorebtn').bind({
                    click: function() {
                        //alert("mostviewedmorebtn");
                        $('#mediavaletlibraryparaid').html('<button id="mediavaletlibraryid" style="background: none !important; font: inherit; margin: 10px; padding: 0px !important; border: currentColor; border-image: none; color: rgb(39, 38, 17); cursor: pointer; font-size-adjust: inherit; font-stretch: inherit;">Media Liabrary</button><img src="images/arrow_right.png" /><label>Most Viewed</label>');

                        var count = mvCore.NumberOfImageForInfiniteScroll('#bindsearchdatadiv');
                        mostviewedoffset = count;
                        mostviewedcount = 0;
                        var mostviwed = mvCore.MostViwedAsset(option.url, 'medium', 'filter', option.token, 0, count);
                        SearchingScreen.ImageLoading(mostviwed, 0,'mostview');

                        ////Binding event for Media Liarary link to get back to home page
                        //$('#mediavaletlibraryid').bind({
                        //    click: function () {
                        //    $('#bindsearchdatadiv').html(Model.DefaultSearchPanel());
                        //    $('#mediavaletlibraryparaid').html('');
                        //    var token = mvCore.GetCookies('cookiestkn');
                        //    var url = mvCore.GetCookies('urlapi');
                        //    var viewportinformation = mvCore.NumberOfImagesToLoad('#bindsearchdatadiv');
                        //    if (Number(viewportinformation) != NaN && Number(viewportinformation) != 0) {
                        //        var recentlyviwed = mvCore.RecentlyUploadedAsset(option.url, 'medium', 'filter', option.token, 0, viewportinformation * 2);
                        //        var mostviwed = mvCore.MostViwedAsset(option.url, 'medium', 'filter', option.token, 0, viewportinformation * 2);
                        //        DefaultScreenLoading.ImageLoading(mostviwed, recentlyviwed);
                        //    } else {
                        //        $('#bindsearchdatadiv').html('Error: Image cannot be Loaded ');
                        //    }
                        //    }
                        //});

                        //Binding event for scrolling 
                        $(window).scroll(function () {
                            if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                                mostviewedcount = 10;
                                  var mostviwed = mvCore.MostViwedAsset(option.url, 'medium', 'filter', option.token, mostviewedoffset, mostviewedcount);
                                   SearchingScreen.ImageLoading(mostviwed, mostviewedoffset,'mostview');
                                 mostviewedoffset = mostviewedoffset + mostviewedcount;

                            }
                        });
                        /*  Loading Default Screen*/
                        $('#mediavaletlibraryid').bind({
                            click: function() {
                             window.location.reload();
                            }
                        });
                    }
                });
            },
            SettingsButtonEvent: function () {
                $('#searchsettingsbtn').bind({
                    click: function () {
                        
                         $(this).data('clicked', true);
                         $('.menu2').slideToggle('fast');
                        $('.menu1').hide();
                        $(this).focusout(function () {
                            $('.menu2').hide();
                        });

                        $("#settingsolid li:not(:eq(0))").click(function () {
                            alert("hello");
                        });
                       
                       
                    }
                });
               
            },
            MenuButtonEvent: function () {
                $('#menubtn').bind({
                    click: function () {
                        $(this).data('clicked', true);
                        $('.menu1').slideToggle('fast');
                        $('.menu2').hide();
                        $(this).focusout(function () {
                            $('.menu1').hide();
                        });
                    }
                });
            }
        };
    })();

    $.fn.LoginUI = function (options) {
        var cookiesvalue = mvCore.GetCookies('cookiestkn');
        if (cookiesvalue == null) {
            //this.html(Model.ShowLoader());
            var defaults = {
                customText: 'Welcome',
                redirect: '',
                view: {
                    recentview: true,
                    mostvisited: false
                }
            }
            var settings = $.extend({}, defaults, options);
            this.html(Model.LoginPanel(settings));
            Events.BindLoginEvent();
        } else {
            //Loading user's default page if user's access token is still valid
            $(this).SearchUI(options);
        }
    }
    $.fn.SearchUI = function (options) {
        if (mvCore.GetCookies('cookiestkn') != null || mvCore.GetCookies('cookiestkn') != undefined) {
            var defaults =
             {
                 token: mvCore.GetCookies('cookiestkn'),
                 url: mvCore.GetCookies('urlapi'),
                 view: {
                     recentview: true,
                     mostvisited: true
                 }
             }
            
            var settings = $.extend({}, defaults, options);
            $(this).html(Model.SearchPanel(settings));
            Events.SettingsButtonEvent();
            Events.MenuButtonEvent();
         
            Events.SearchingEvent(options);
            //Calling categories whose value is set to true
            //Calling RecentlyUploaded category
            if (settings.view.recentview) {
                $('#bindsearchdatadiv').append(Model.RecentlyUploadedPanel(settings));
                Events.RecentUploadedEvent(settings);
                Events.RecentUploadedMoreEvent(settings); //For More button
            }
            
            //Calling MostViewed category
            if (settings.view.mostvisited) {
                $('#bindsearchdatadiv').append(Model.MostViewedPanel(settings));
                Events.MostViewedEvent(settings);
                Events.MostViewedMoreEvent(settings);   //For More button
            }
        }
    }
   

}(jQuery, typeof window !== "undefined" ? window : this, mvCore);