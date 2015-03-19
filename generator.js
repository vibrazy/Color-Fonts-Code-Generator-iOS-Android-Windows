var newLine = "\n";

function generateFilesForPlatform(platform, prefix)
{

  // lets generate some stuff
  // 0 is iOS
  // 1 is Android
  // 2 is Windows

  var fontFunction;
  var colorFunction;

  if (platform == 0) 
  {
    fontFunction = generateFontiOS;
    colorFunction = generateColoriOS;
  } 
  else if (platform == 1)
  {
    fontFunction = generateFontAndroid;
    colorFunction = generateColorAndroid;
  }
  else
  {
    fontFunction = generateFontWindows;
    colorFunction = generateColorAndroid;
  }

  generateFontFilesForPlatform(platform, prefix, 'UIFont', fontFunction)
  generateFontFilesForPlatform(platform, prefix, 'UIColor', colorFunction)

}

function generateLineForPlatform(methodName, codeSignature, platform, output, method, callback)
{
  if (platform == 0)
  {
    output += methodName;
    output += newLine;
    output += "{";
    output += newLine;
    output += codeSignature;
    output += newLine;
    output += "}";    
    output += newLine;  
    output += newLine;  
  } 
  else if (platform == 1)
  {
      output += "<style name=\""+methodName+"\" parent=\"@android:style/TextAppearance\">";   
  }

    return output;
}

function call_others(function_name, object) 
{  
  eval(function_name + "(" + eval(object) +")");
}

var main = this;

function generateFontFilesForPlatform(platform, prefix, classType, callback)
{
  var methodSignatures = [];
  var codes = [];
  var output = '';


  var parsingFont = classType == 'UIFont';
  var swatchLayers = getSwatchLayer(parsingFont ? 'Font Swatch' : 'Color Swatch');
  var memberClass = parsingFont ? [MSTextLayer class] : [MSShapeGroup class];


  var isIOS = platform == 0;
  var isAndroid = platform == 1;
  var isWindows = !isIOS && !isAndroid;

  for (var i=0; i < [swatchLayers count]; i++)
  {
    var layer = [swatchLayers objectAtIndex:i];

    if ([layer isMemberOfClass:memberClass])
    {
      var swatchName = layer.name();

      if (swatchName != "please rename")
      {

        if (isIOS) 
        {
          swatchName = makeNiceName(swatchName);

          var methodName = generateMethodSignature(classType, swatchName, prefix);            
          methodSignatures.push(methodName);
          // 
          var codeSignature = callback(layer)
          output = generateLineForPlatform(methodName, codeSignature, platform, output, callback);            
        }
        else if (isAndroid)
        {

          if (parsingFont)
          {
            output += "<style name=\""+swatchName+"\" parent=\"@android:style/TextAppearance\">";
            output += newLine;
            output += callback(layer);
            output += "</style>";
            output += newLine;
            output += newLine;  
          }
          else
          {
              output += callback(layer).replace("{template}", swatchName);  
              output += newLine;            
          }
        }
        else
        {
           if (parsingFont)
          {
            output += "<Style x:Key=\""+swatchName+"\" TargetType=\"TextBlock\">";
            output += newLine;
            output += callback(layer);
            output += "</Style>";
            output += newLine;
            output += newLine;
          }
        else
          {          
              var sanitiseString = callback(layer).replace("{template}", swatchName);
              sanitiseString = sanitiseString.replace('color', 'Color');
              sanitiseString = sanitiseString.replace('/color', '/Color');              
              sanitiseString = sanitiseString.replace('name=', 'x:Key=');
              output += sanitiseString;
              output += newLine;            
          }
        }
      }
    }
  }

  // BIG IF STATEMENT HERE FOR PLATFORM
  if (isIOS) 
  {
    var mPrefix  = "#import \""+classType+"+Sketch.h\"";
    mPrefix += newLine;
    mPrefix += newLine;
    mPrefix += "@implementation "+classType+" (Sketch)";
    mPrefix += newLine;
    mPrefix += newLine;
    mPrefix += output;
    mPrefix += newLine;
    mPrefix += "@end";

    var hPrefix  = "#import <UIKit/UIKit.h>";
    hPrefix += newLine;
    hPrefix += newLine;
    hPrefix += "@interface "+classType+" (Sketch)";
    hPrefix += newLine;
    hPrefix += newLine;
    hPrefix += methodSignatures.join(newLine);
    hPrefix += newLine;
    hPrefix += newLine;
    hPrefix += "@end";

    var mPath = getDocumentPath() + classType + "+Sketch.m";
    var hPath = getDocumentPath() + classType + "+Sketch.h";

    saveFile(mPath, mPrefix);
    saveFile(hPath, hPrefix);
  }
  else if (isAndroid)
  {
    var header = '<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<resources xmlns:android=\"http://schemas.android.com/apk/res/android\">\n';
    header += output;
    header += "</resources>";

    var filename = (parsingFont ? "Fonts.xml" : "Colors.xml");
    var mPath = getDocumentPath() + filename;
    saveFile(mPath, header);
  }
   else if (isWindows)
  {
    var header = '<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<ResourceDictionary xmlns=\"http://schemas.microsoft.com/winfx/2006/xaml/presentation\" xmlns:x=\"http://schemas.microsoft.com/winfx/2006/xaml\">\n';
    header += output;
    header += "</ResourceDictionary>";

    var filename = (parsingFont ? "Fonts.xaml" : "Colors.xaml");
    var mPath = getDocumentPath() + filename;
    saveFile(mPath, header);
  }

}

function getSwatchLayer(name)
{
  var pages = [doc pages];

  var swatchPage;

  for (var i=0; i < [pages count]; i++)
  {
    if (pages[i].name() == name)
    {
      swatchPage = pages[i];
      break;
    }
  }

  return [swatchPage layers];
}

function generateMethodSignature(className, name, prefix)
{
    return "+ ("+className+" *)" + prefix + name;
}

function generateFontiOS(layer)
{
  return "  return [UIFont fontWithName:@\"" + layer.fontPostscriptName() + "\" size:" + layer.fontSize() + ".f];";
}

function generateFontAndroid(layer)
{
  var output = newLine;
  output = "  <item name=\"typeface\">"+layer.fontPostscriptName()+".ttf</item>";
  output += newLine;
  output += "  <item name=\"android:textSize\">"+layer.fontSize()+"sp</item>";
  output += newLine;

  log(output);

  return output;
}

function generateFontWindows(layer)
{  
  var output = newLine;
  output = "  <Setter Property=\"FontFamily\" Value=\""+layer.fontPostscriptName()+"\" />";
  output += newLine;
  output += "  <Setter Property=\"FontSize\" Value=\""+layer.fontSize()+"\" />";
  output += newLine;

  return output;
}

function generateColoriOS(layer)
{
  var fill = layer.style().fills().firstObject();
  var red = fill.color().red().toFixed(3).toString();
  var green = fill.color().green().toFixed(3).toString();
  var blue = fill.color().blue().toFixed(3).toString();
  var alpha = fill.color().alpha().toFixed(3).toString();

  return "  return [UIColor colorWithRed:" + red + " green:" + green + " blue:" + blue + " alpha:" + alpha + "];";
}

function generateColorAndroid(layer)
{
   var fill = layer.style().fills().firstObject();
  var red = parseInt((fill.color().red().toFixed(3) * 255).toFixed(0));
  var green = parseInt((fill.color().green().toFixed(3) * 255).toFixed(0));
  var blue = parseInt((fill.color().blue().toFixed(3) * 255).toFixed(0));
  var alpha = parseInt((fill.color().alpha().toFixed(3) * 255).toFixed(0));

  return  "<color name=\"{template}\">#"+rgba2hex(red,green,blue,alpha)+"</color>";
  
}

// convert RGBA color data to hex
function rgba2hex(r, g, b, a) {
    if (r > 255 || g > 255 || b > 255 || a > 255)
        throw "Invalid color component";
    return (256 + r).toString(16).substr(1) +((1 << 24) + (g << 16) | (b << 8) | a).toString(16).substr(1);
}


