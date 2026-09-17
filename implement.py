from pathlib import Path
import re,json

root=Path(__file__).parent
p=root/'public'
html=(root/'baseline/index.html').read_text(encoding='utf-8')
hero='''<section class="hero" aria-labelledby="hero-title">
 <div class="hero-copy">
  <p class="eyebrow">PRACTICAL PSYCHOLOGY · HINDI &amp; HINGLISH PDFs</p>
  <h1 id="hero-title">Think of the perfect reply<br><em>after the conversation is over?</em></h1>
  <p class="hero-lede">Stop replaying the conversation in your head. Practise what to say when someone pressures you, the conversation goes quiet, or you need to speak up at work.</p>
  <p class="hero-price">One guide <strong>₹199</strong> <span>or all 5 in one language <strong>₹699</strong></span></p>
  <div class="hero-actions"><a class="button button-dark" href="#bundles">Choose my 5-guide set</a><a class="button button-plain" href="#sample">Read a real sample</a></div>
  <p class="delivery-line">PDF downloads · One-time payment · Read on your phone</p>
 </div>
 <div class="inside-panel"><p class="eyebrow">WHAT YOU’LL LEARN TO HANDLE</p><ul class="value-checklist">
 <li><strong>“I feel guilty saying no.”</strong><span>Say no without a long excuse.</span></li>
 <li><strong>“My mind goes blank.”</strong><span>Know what to ask when the conversation goes quiet.</span></li>
 <li><strong>“Why do they keep treating me this way?”</strong><span>Understand what someone’s repeated actions tell you.</span></li>
 <li><strong>“How do I talk to someone I like?”</strong><span>Start talking and notice whether they want to talk too.</span></li>
 <li><strong>“How do I speak up at work?”</strong><span>Find words for meetings and workload.</span></li>
 </ul><a href="#library">Prefer one topic? Choose a guide for ₹199</a></div>
</section>'''
benefits_panel=re.search(r'<div class="inside-panel">.*?</div>',hero,re.S).group(0)
hero=hero.replace(benefits_panel,'<figure class="bundle-visual"><a href="/bundle-visual.webp" target="_blank" rel="noopener"><img class="bundle-art" src="/bundle-visual.webp" width="1536" height="1024" alt="Five illustrated Seedhi Baat PDF guide covers: manipulation, conversation, understanding people, connection and speaking up at work" fetchpriority="high"></a><figcaption>5 downloadable PDF guides. Choose Hindi or Hinglish.</figcaption></figure>')
html=re.sub(r'<section class="hero".*?</section>',hero,html,count=1,flags=re.S)
match=re.search(r'<section class="section bundles".*?</section>',html,re.S)
bundle=match.group(0)
html=html.replace(bundle,'')
bundle=re.sub(r'<div class="section-heading">.*?</div>','''<div class="section-heading"><p class="eyebrow">YOUR COMPLETE PSYCHOLOGY SET</p><h2 id="bundle-title">Five guides. Know exactly what you’re getting.</h2><p>Choose your reading language. Each ₹699 set includes the five titles below, with 100 everyday situations per guide. Buying these five separately costs ₹995.</p></div>''',bundle,count=1,flags=re.S)
html=html.replace('<section class="section library"',bundle+'\n<section class="section library"',1)
html=re.sub(r'<p class="library-note".*?</p>','',html,flags=re.S)
html=html.replace('Choose the one conversation you struggle with most.','Start with the situation you want to handle.')
html=html.replace('THE GUIDES · RS. 199 EACH','INDIVIDUAL PSYCHOLOGY GUIDES · ₹199 EACH')
sample='''<section class="section sample-section" id="sample"><div class="section-heading"><p class="eyebrow">READ BEFORE YOU BUY</p><h2>A real example from Baat Karna Seekho.</h2><p>This is an excerpt from the Hinglish guide, page 4. Read the language and approach for yourself.</p></div><article class="sample-card"><p class="eyebrow">05 · DIMAAG BLANK HO JAAYE</p><h3>You don’t need a perfect line. Start with what you heard.</h3><blockquote>Pause ko emergency mat banaayein. Jo last suna tha us par laut sakte hain: “Aap keh rahe the ki naya role kaafi different hai. Sabse bada change kya raha?”</blockquote><p>Agar kuch yaad na aaye, ek simple topic shift theek hai. “Waise, aap yahan kaise aaye?” Har pause bharne ke liye joke banaana zaroori nahi.</p><a href="/samples/conversation-page-4.webp" target="_blank" rel="noopener">Open the actual page image</a></article><p class="sample-next">Explore the whole set, or start with the conversation guide.</p><div class="hero-actions"><a class="button button-dark" href="#bundles">See the 5-guide sets</a><button class="button button-plain" data-buy="conversation-hinglish">Get Baat Karna Seekho — ₹199</button></div></section>'''
html=html.replace(bundle,bundle+'<section class="section everyday-benefits">'+benefits_panel+'</section>'+sample,1)
html=html.replace('Your private download links appear only after the payment is verified on our server.','After successful payment, your download links appear here. Save the PDFs and start reading.')
html=re.sub(r'<section class="editorial-note">.*?</section>','',html,flags=re.S)
html=html.replace('<div class="upgrade-offer"','<div id="checkoutContents" class="checkout-contents"></div>\n        <div class="upgrade-offer"',1)
html=html.replace('Complete your purchase</h2>','Review your purchase</h2>')
html=html.replace('Used to identify this purchase. No marketing emails.','Use an email you can access. No marketing emails.')
html=html.replace('Pick one title, one language set, or the complete ten-book library.','Choose one guide or all five in Hindi or Hinglish.')
html=html.replace('</main>','''<section class="section ai-section" id="ai"><div class="section-heading"><p class="eyebrow">AI &amp; HOME BUSINESS</p><h2>Learn the skills. Put an idea into practice.</h2><p>Two practical guides: one helps you choose a service to offer, the other helps you use AI to do the work. ₹299 each or ₹499 together.</p></div><div id="aiBundleGrid" class="bundle-grid"></div><div id="aiBookGrid" class="book-grid"></div></section></main><nav class="mobile-buybar" aria-label="Quick purchase"><span>5 psychology guides<br><strong>₹699 · choose language</strong></span><a class="button button-dark" href="#bundles">See sets</a></nav>''')
html=html.replace('<a href="#how">How it works</a>','<a href="#sample">Read a sample</a><a href="/?offer=ai">AI books</a>')
(p/'index.html').write_text(html,encoding='utf-8')

js=(root/'baseline/app.js').read_text(encoding='utf-8')
start=js.index('  // UI population')
end=js.index('  // Language toggle removed',start)
replacement='''  const aiOffer = new URLSearchParams(location.search).get('offer') === 'ai';
  if (aiOffer) {
    document.body.classList.add('ai-offer');
    document.title = 'AI Skills & Business Starter Pack — Seedhi Baat';
    document.getElementById('top').prepend(document.getElementById('ai'));
    document.querySelector('.skip-link').href = '#ai';
    document.querySelector('.site-header a[href="#library"]').href = '/';
    document.querySelector('.site-header a[href="#sample"]').href = '/#sample';
    document.querySelector('#how .steps li p').textContent = 'Choose one AI guide or both books together.';
    document.querySelector('.mobile-buybar span').innerHTML = '2 practical AI guides<br><strong>₹499 together</strong>';
    const quick = document.querySelector('.mobile-buybar a'); quick.href = '#ai'; quick.textContent = 'See AI pack';
  }
  const aiIds = new Set(['ideas-25-under-2k', 'ai-pro-guide']);
  const benefits = {
    manipulation: 'Recognise guilt, pressure and unfair demands. Practise a clear response.',
    conversation: 'Start a conversation, ask a follow-up and handle awkward pauses.',
    people: 'Notice when someone’s words and actions don’t match, and look for repeated patterns.',
    attraction: 'Start talking to someone you like and notice whether they want to keep talking too.',
    office: 'Use practical lines for meetings, feedback and workload conversations.'
  };
  function displayName(product) {
    return product.id === 'bundle-complete' ? 'All 5 guides in Hindi + Hinglish' : product.name;
  }
  function includedBooks(product) {
    return product.bookIds.map(id => catalog.books.find(b => b.id === id)).filter(Boolean);
  }
  function titleList(product) {
    return '<ul class="included-titles">' + includedBooks(product).map(b => '<li>' + esc(b.title) + (product.language === 'Both' ? ' <small>(' + esc(b.language) + ')</small>' : '') + '</li>').join('') + '</ul>';
  }
  function populateUI() {
    if (!catalog || !catalog.products) return;
    const products = catalog.products;
    bundleGrid.innerHTML = '';
    bookGrid.innerHTML = '';
    const aiBundles = document.getElementById('aiBundleGrid');
    const aiBooks = document.getElementById('aiBookGrid');
    aiBundles.innerHTML = ''; aiBooks.innerHTML = '';
    products.filter(p => p.kind === 'bundle' && p.id !== 'bundle-complete').forEach(product => {
      const isAI = product.bookIds.some(id => aiIds.has(id));
      const separate = product.bookIds.reduce((sum, id) => {
        const single = products.find(p => p.kind === 'single' && p.bookIds.length === 1 && p.bookIds[0] === id);
        return sum + (single ? single.amount : 0);
      }, 0);
      const saving = separate - product.amount;
      const count = product.bookIds.length;
      const item = document.createElement('article');
      item.className = 'bundle-card';
      item.innerHTML = `<p class="badge">${product.language === 'Both' ? '5 subjects · 2 languages · 10 PDFs' : esc(product.language) + ' · ' + count + ' PDFs'}</p>
        <h3>${esc(displayName(product))}</h3>
        <p>${product.language === 'Both' ? 'The same five guides in both languages. Choose the version you prefer for each read.' : esc(product.description)}</p>
        ${titleList(product)}
        <div class="bundle-meta"><div class="bundle-price"><strong>${formatPrice(product.amount, product.currency)}</strong>${saving > 0 ? '<span>Separately ' + formatPrice(separate, product.currency) + ' · Save ' + formatPrice(saving, product.currency) + '</span>' : ''}<span>One-time payment · digital PDFs</span></div>
        <button type="button" class="button bundle-select">Get ${count} PDFs — ${formatPrice(product.amount, product.currency)}</button></div>`;
      (isAI ? aiBundles : bundleGrid).appendChild(item);
      item.querySelector('button').addEventListener('click', () => openCheckout(product));
    });
    products.filter(p => p.kind === 'single').forEach(product => {
      const book = includedBooks(product)[0];
      if (!book || book.language === 'Hindi') return;
      const isAI = aiIds.has(product.id);
      const topic = product.id.split('-')[0];
      const item = document.createElement('article');
      item.className = 'book-card';
      item.id = 'book-' + product.id;
      const cover = isAI ? '' : `<div class="topic-number" aria-hidden="true">0${Object.keys(benefits).indexOf(topic) + 1}</div>`;
      item.innerHTML = `${cover}<div class="book-info"><p class="book-topic">${esc(book.topic)} · PDF</p><h3>${esc(book.title)}</h3><p class="book-description">${esc(benefits[topic] || book.description)}</p><p class="book-language">${esc(book.language)}${isAI ? '' : ' · 100 everyday situations'}</p><div class="book-buy"><strong>${formatPrice(product.amount, product.currency)}</strong><button class="small-buy book-select" type="button">Get this guide</button></div>${!isAI ? '<button class="language-alternative" type="button">Buy this title in Hindi instead</button>' : ''}</div>`;
      (isAI ? aiBooks : bookGrid).appendChild(item);
      item.querySelector('.book-select').addEventListener('click', () => openCheckout(product));
      const hindiButton = item.querySelector('.language-alternative');
      if (hindiButton) hindiButton.addEventListener('click', () => {
        const hindi = products.find(p => p.id === topic + '-hindi');
        if (hindi) openCheckout(hindi);
      });
    });
    if (catalog.supportEmail) document.getElementById('supportLine').textContent = 'Support: ' + catalog.supportEmail;
    document.querySelectorAll('[data-buy]').forEach(button => button.addEventListener('click', () => {
      const product = products.find(p => p.id === button.dataset.buy);
      if (product) openCheckout(product);
    }));
    if (location.hash === '#ai') document.getElementById('ai').scrollIntoView();
  }

'''
js=js[:start]+replacement+js[end:]
js=js.replace('checkoutProduct.textContent = product.name;',"checkoutProduct.textContent = displayName(product);\n    document.getElementById('checkoutContents').innerHTML = '<p><strong>' + esc(product.language === 'Both' ? 'Hindi + Hinglish' : product.language) + '</strong> · ' + product.bookIds.length + ' PDF' + (product.bookIds.length > 1 ? 's' : '') + ' · one-time purchase</p>' + '<details><summary>View the included PDFs</summary>' + titleList(product) + '</details><p>Download links appear after successful payment.</p>';")
(p/'app.js').write_text(js,encoding='utf-8')
css=(root/'baseline/styles.css').read_text(encoding='utf-8')
css+='''
.ai-offer .hero,.ai-offer .promise-strip,.ai-offer #bundles,.ai-offer #library,.ai-offer #sample,.ai-offer .everyday-benefits { display:none; }

.topic-number { font:italic 2.5rem/1 Georgia,serif; color:#17675f; padding-top:5px; }
.bundle-art { display:block; width:100%; height:auto; margin:0; }
.bundle-visual { margin:0; }
.bundle-visual figcaption { font-size:.875rem; padding:10px 0; color:#49514b; }

/* Conversion review: explicit value, readable controls, real covers. */
[hidden] { display:none !important; }
.hero { min-height:0; padding-top:48px; padding-bottom:48px; gap:40px; align-items:center; }
h1 { font-size:clamp(2.4rem,4.6vw,4.2rem); line-height:1.08; }
h2 { font-size:clamp(1.8rem,3.4vw,3rem); line-height:1.14; }
.hero-lede { font-size:1.05rem; }
.hero-price { font-size:1rem; }.hero-price span { display:block; margin-top:5px; }
.hero-price strong { font-size:1.35rem; }.delivery-line { font-size:.875rem; }
.inside-panel { border:1px solid var(--line); padding:28px; background:#fffdf7; }
.value-checklist { padding:0; list-style:none; margin:0 0 20px; }
.value-checklist li { padding:12px 0 12px 26px; position:relative; border-bottom:1px solid var(--line); }
.value-checklist li::before { content:'✓'; position:absolute; left:0; color:#17675f; font-weight:bold; }
.value-checklist strong,.value-checklist span { display:block; }.value-checklist span { font-size:1rem; margin-top:4px; }
.section { padding-top:56px; padding-bottom:56px; }.section-heading { margin-bottom:28px; }
.sample-section { display:grid; grid-template-columns:1fr 1.2fr; gap:20px 40px; }
.sample-card { padding:26px; background:white; border:1px solid var(--line); }
.sample-card h3 { font-size:1.3rem; }.sample-card blockquote { margin:0; font:1.1rem/1.65 Georgia,serif; }.sample-card p { font-size:1rem; }
.sample-card a,.language-alternative,.inside-panel a { text-underline-offset:4px; }
.sample-next { margin:0; }.sample-section .hero-actions { margin:0; }
.bundle-card { min-height:0; padding:24px; }.bundle-card h3 { margin:18px 0 12px; font-size:1.6rem; }
.bundle-card p,.included-titles { font-size:1rem; opacity:1; }.included-titles { padding-left:20px; line-height:1.5; }
.included-titles li { margin-bottom:10px; }.bundle-card .badge { font-size:.875rem; letter-spacing:0; text-transform:none; }
.bundle-meta { display:flex; flex-direction:column; align-items:stretch; gap:18px; padding-top:20px; }
.bundle-price span { display:block; font-size:.875rem; opacity:1; margin-top:8px; }
.bundle-card .button { background:#f5c451; border-color:#f5c451; color:#191c1a; width:100%; font-size:1rem; }
.bundle-card .button:hover { background:#ffda80; color:#191c1a; }
.button,.small-buy { min-height:48px; font-size:1rem; }.eyebrow,.book-topic { font-size:.875rem; letter-spacing:.06em; }
.book-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:28px; }
.book-card { display:grid; grid-template-columns:52px minmax(0,1fr); gap:20px; align-items:start; max-width:none; margin:0; border-bottom:1px solid var(--line); padding-bottom:24px; }
.actual-cover { width:100%; height:auto; display:block; border:1px solid var(--line); }
.book-info { padding:0; }.book-info h3 { font-size:1.3rem; }.book-description { font-size:1rem; min-height:0; line-height:1.55; }.book-language { font-size:.875rem; }
.small-buy { background:#191c1a; color:white; padding:10px 15px; border:0; }.book-buy { flex-wrap:wrap; }
.language-alternative { border:0; background:none; text-decoration:underline; padding:12px 0; cursor:pointer; text-align:left; font-size:.875rem; color:#303b34; }
.ai-section { border-top:1px solid var(--line); }.ai-section .bundle-card { background:#202522; color:white; margin-bottom:28px; }.ai-section .book-card { display:block; }
.checkout-contents { font-size:.875rem; }.checkout-contents .included-titles { font-size:.875rem; max-height:160px; overflow:auto; }
.dialog-content h2 { font-size:1.8rem; }label,label small { font-size:.875rem; }input { font-size:1rem; }.fine-print { font-size:.8rem; }
dialog { max-height:90dvh; overflow:auto; }.icon-button { min-width:44px; min-height:44px; }
.mobile-buybar { display:none; }a:focus-visible,button:focus-visible,summary:focus-visible { outline:3px solid #168b83; outline-offset:4px; }
@media(max-width:680px) {
 .site-header { height:64px; }.hero { padding:28px 18px; gap:24px; }.hero h1 { font-size:2.35rem; }.hero-lede { font-size:1rem; margin:16px 0; }
 .hero-actions { gap:10px; }.hero-actions .button { padding:12px 15px; }.inside-panel { padding:20px; }.section { padding:36px 18px; }
 .sample-section { display:block; }.sample-card { padding:20px; margin-bottom:20px; }.sample-next { margin-bottom:14px; }
 .book-grid { grid-template-columns:1fr; }.book-card { grid-template-columns:40px minmax(0,1fr); gap:16px; max-width:none; margin:0; }.book-info h3 { font-size:1.2rem; }
 .bundle-grid { grid-template-columns:minmax(0,1fr); }.bundle-card { padding:22px; }.bundle-card h3 { font-size:1.5rem; }
 .mobile-buybar { display:flex; position:fixed; bottom:0; left:0; right:0; z-index:10; justify-content:space-between; align-items:center; gap:12px; padding:10px 16px calc(10px + env(safe-area-inset-bottom)); border-top:1px solid var(--line); background:#fffdf7; box-shadow:0 -3px 16px #00000010; }
 .mobile-buybar span { font-size:.8rem; }.mobile-buybar .button { padding:10px 18px; }body { padding-bottom:90px; }
 .dialog-content { padding:38px 22px 24px; }.promise-strip { font-size:.875rem; letter-spacing:0; }.trust-list { display:none; }
}
'''
(p/'styles.css').write_text(css,encoding='utf-8')
print('Updated HTML, CSS and JS against live baseline; payment implementation retained.')
