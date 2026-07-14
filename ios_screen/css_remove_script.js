

//Frontend CSS remover script
function RemoveUnwantedCss(data) {
    
    let element =  document.createElement('div');
    element.innerHTML = data;
    let styles = element.querySelectorAll('[style]');
    styles.forEach(style => style.removeAttribute('style'));
    return element.innerHTML;
    
}
let frontend_css_remover = RemoveUnwantedCss("<p><span style=color: rgb(38, 50, 56); font-family: Roboto, sans-serif; font-size: 13px;">"Get 40% off coupon code for Quickheal&nbsp;</span>Android</p><p>Quick Heal Technologies Ltd. (Formerly Known as Quick Heal Technologies Pvt. Ltd.) is one of the leading IT security solutions company. Each Quick Heal product is designed to simplify IT security management across the length and depth of devices and on multiple platforms. They are customized to suit consumers, small businesses, Government establishments and corporate houses.</p>");

//Backend CSS remover script
function removeInlineStyles(html) {
  return html.replace(/\s*style\s*=\s*(['"]).*?\1/gi, '');
}
 
// const html = `<div style="color:red"><p style="font-size:20px">Hello</p></div>`;
const html = `<p><span style="color: rgb(38, 50, 56); font-family: Roboto, sans-serif; font-size: 13px;">"Get 40% off coupon code for Quickheal&nbsp;</span>Android</p><p>Quick Heal Technologies Ltd. (Formerly Known as Quick Heal Technologies Pvt. Ltd.) is one of the leading IT security solutions company. Each Quick Heal product is designed to simplify IT security management across the length and depth of devices and on multiple platforms. They are customized to suit consumers, small businesses, Government establishments and corporate houses.</p>`;
console.log(removeInlineStyles(html));


