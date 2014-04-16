		
var fulltrim=function(wd){return wd.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');}

var remove_punctuations = function(s){
	return s.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
}

var tokenize= function(str){
  tokens= remove_punctuations(fulltrim(str)).split(/(\w+|\!|\'|\"")/i);
  tokens2 =_.filter(tokens, function(wd){ 
    return (wd != "" && wd!=" "); 
  });
  return tokens2;
}