function extractPageText() {
  let text = '';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  while (walker.nextNode()) {
    text += walker.currentNode.nodeValue + ' ';
  }
  return text.trim();
}

const pageText = extractPageText();

chrome.runtime.sendMessage({ type: 'pageContent', text: pageText });