var
  $             = require('jquery')
, colors        = require('colors')
, sys           = require('sys')
, childProcess  = require('child_process')

, terp = function(str, values){
    return str.replace(/{([^{}]*)}/g, function(a, b){
      var r = values[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    });
  }

, regs = {
    bem: /\<(em|b)\>\w*\<\/(em|b)>/g
  , tags: /<[^>]*>/g
  }

, url = "http://www.google.com/search?q="

, views = {
    results: function(results){
      var view = "";

      for (var i = 0; i < results.length; i++){
        view += "\n" + views.result(results[i]) + "\n";
      }

      return view;
    }

  , result: function(result){
      var
        view = [
          '['.yellow + '{index}' + ']'.yellow + ' - {title}'
        , '{url}'
        , '{details}'
        ]
      , spaces = ""

      , colored = {
          "index" : ("" + result.index).numbers
        , "title" : result.title.title
        , "url"   : result.url.url
        , details : result.details
        }
      ;

      // get spacing for url right
      for (var i = view[0].indexOf("] - ") + "] - ".length + 1; i >= 0; i--) {
        spaces += "";
      }

      view[1] = spaces + view[1];

      view = view.join('\n');

      return terp(view, colored);
    }
  }

, outputData = function(data, callback){
    var
      $data = $(data).find('#ires')
    , results = []
    ;

    $data.find('.g').each(function(index, $g){
      $g = $($g);
      if ($g.find('.st').length === 0) return;

      results.push({
        index:    index
      , title:    $g.find('a').html().replace(regs.tags, "")
      , url:      $g.find('cite').html().replace(regs.tags, "")
      , details:  $g.find('.st').html().replace(regs.tags, "")
      });
    });

    console.log(views.results(results));

    waitForInput(results, callback);
  }

, waitForInput = function(results, callback){
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    var prev = "", data = "";
    process.stdin.on('data', function(text){
      data += text;
      if (data.indexOf("\n") > -1) return openUrl(results[parseInt(data)].url, callback);
    });
  }

, openUrl = function(url, callback){
    if (url.indexOf('http://') === -1) url = "http://" + url;

    var command = '/usr/bin/open ' + url;
    console.log(command);
    childProcess.exec(command, callback);
  }

, format = function(data){
    return data;
    // bold/highlight rule
    // data = data.replace(regs, );
  }
;

colors.setTheme({
  title:    'blue'
, matched:  'yellow'
, numbers:  'cyan'
, url:      'green'
});

module.exports = {
  query: function(query, config, callback){
    if (typeof config === "function"){
      callback = config;
      config = {};
    }

    var options = {
      method: "GET"
    , text: "text"
    , contentType: "text"
    , success: function(data){
        outputData(data, callback);
      }
    , error: function(error){
        console.log("!!!!!!!!");
        console.log(error);
        callback(error);
      }
    };

    for (var key in options){
      if (config.hasOwnProperty(key)) options[key] = config[key];
    }

    $.ajax(url + query, options);
  }
};