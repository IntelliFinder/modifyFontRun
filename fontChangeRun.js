prism.run([function() {

    //	Only run for specific chart types
    var chartTypes = ["chart/pie"];

    //	Option details
    var propertyName = 'changeFont';

    //	Formatting options
    var fontSize = '20px',
        color = 'black',
        fill='black';
   

    
    //////////////////////////
    //	Utility Functions	//
    //////////////////////////

    //	Function to make sure this is a supported chart type
    var checkChartType = function(type) {
        if (chartTypes.indexOf(type)>=0){
            return true;
        } else {
            return false;
        }
    }

    //	Function to make sure the setting is enabled
    var checkChartSetting = function(style) {
        if (style[propertyName]){
            return true;
        } else {
            return false;
        }
    }
    //////////////////////////
    //	Business Logic		//
    //////////////////////////
    //This is analogous to changing colors and the recipricating function for removing the old colors specified below
    //	Function to highlight the selected slice(s)
    var modifyPieChart = function(sender,event) {		

        //	Get the highcharts object
        var highcharts = sender.queryResult;
        var labeler = highcharts.pie-percent-label;

        //	Loop through each series, but there should be only 1
        $.each(labeler,function(){

            //	Loop through the style for this class
            
            this.css("color", fontColor );
            this.css("fill", fill);
            this.css("fontSize", fontSize);
             
            
        })
    }
    //*change the element to find the color and then recursively change the color to specification*
    //	Function to get rid of the gross grey borders around each slice
    var hideGrey = function(sender,event){

        //	Find the widget element
        var widgetElement;
        if (prism.$ngscope.appstate === "widget"){
            //	In the widget Editor
            widgetElement = $('div.prism-widget-preview');
        } else {
            //	In the dashboard
            widgetElement = $('widget[widgetid="' + sender.oid + '"]');
        }

        //	Find the tracker g
        var tracker = $('g.highcharts-tracker', widgetElement);

        //	Loop through each path within the tracker
        $.each($('path',tracker),function(){

            //	Get this element
            var thisEl = $(this);
                
            thisEl.remove();
            
			
        })		
    }


    //////////////////////////////////
    //	Initialization Functions	//
    //////////////////////////////////

    // Registering dashboard/ widget creation in order to perform drilling
    prism.on("dashboardloaded", function (e, args) {
        args.dashboard.on("widgetinitialized", onWidgetInitialized);
    });

    // register widget events upon initialization
    function onWidgetInitialized(dashboard, args) {
        //	Hooking to ready/destroyed events
        args.widget.on("destroyed", onWidgetDestroyed);
		
        //	Only run for specific charts that have this setting enabled
        var typeOk = checkChartType(args.widget.type);
        var settingOk = checkChartSetting(args.widget.style);		

        //	Add hook for when the widget is ready
        if (typeOk && settingOk) {
            args.widget.on("render", modifyPieChart);
            args.widget.on("ready", hideGrey);
        }
    }

    // unregistering widget events
    function onWidgetDestroyed(widget, args) {
        widget.off("destroyed", onWidgetDestroyed);
    }
    // create widget menu
    prism.on('beforemenu', function (e, args) {
        //debugger;

        //filter out the context menus
        if(args.settings.item == undefined) {
            return;
        }

        var widget = args.settings.item.$$panel.$$widget;
      
        //only pivots and numeric fields
        if((widget.type) != 'pie') {
            return;
        }

        // menu heading
        var menuCaption = "Font Option";

        //  Has the menu been added already?
        var addMenuItem = true;
        var menuItems = args.settings.items;

        $.each(menuItems, function(){
            if (this.caption == menuCaption) {
                addMenuItem = false;
            }
        })

        if (addMenuItem) {
            // refresh the widget with the regression line
            function setColumn() {
                widget.colorsettings = this.caption;
                widget.redraw();
            }

            //  Create array of column options
            var columns = [];
            // Value for "checked" key
            //	Find the widget element
            var widgetElement;
            if (prism.$ngscope.appstate === "widget"){
                //	In the widget Editor
                widgetElement = $('div.prism-widget-preview');
            } else {
                //	In the dashboard
                widgetElement = $('widget[widgetid="' + sender.oid + '"]');
            }
            //  Create "disabled" option
            var r0 = {
                caption: "Numeric Values",
                type: "option",
                execute: setColumn,
                checked: widgetElement,
            };
            var r1 = {
                caption: "Text",
                type: "option",
                execute: setColumn,
                checked: widgetElement,
            };


            columns.push(r0);
            columns.push({type: "separator"});
            columns.push(r1);


            //  Add the new menu items
            menuItems.push({type: "separator"});
            menuItems.push({
                caption: menuCaption,
                items: columns
            });
        }
    });
}