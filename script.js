
/* Basic frontend logic: modal, calculator scoring, WhatsApp link generation */
(function(){
  const modal = document.getElementById('calcModal');
  const openBtn = document.getElementById('openCalc');
  const closeBtn = document.getElementById('closeCalc');
  const calcBtn = document.getElementById('calcBtn');
  const form = document.getElementById('calcForm');
  const resultBlock = document.getElementById('resultBlock');
  const resultPercent = document.getElementById('resultPercent');
  const resultText = document.getElementById('resultText');
  const sendWhats = document.getElementById('sendWhats');

  function openModal(){ modal.setAttribute('aria-hidden','false'); }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); resultBlock.style.display='none'; }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  function computeScore(data){
    // base 100, apply penalties/bonuses — simplified but clear
    let score = 100;
    // age
    if(data.age < 21) score -= 15;
    if(data.age >=21 && data.age < 25) score -= 5;
    if(data.age > 65) score -= 20;
    // income vs requested amount -> rough DTI check
    const monthly = Number(data.monthly) || 0;
    const income = Number(data.income) || 0;
    const dti = income ? (monthly / income) : 1;
    if(dti > 0.6) score -= 30;
    else if(dti > 0.4) score -= 15;
    else if(dti > 0.25) score -= 6;
    // existing loans
    if(data.hasLoans === 'yes') score -= 12;
    // delays
    if(data.delays === 'closed') score -= 5;
    if(data.delays === '30') score -= 15;
    if(data.delays === '90') score -= 30;
    // past delays
    if(data.pastDelays === '90') score -= 10;
    if(data.pastDelays === 'over90') score -= 20;
    // other debt
    if(data.otherDebt === 'yes') score -= 18;
    // service-specific adjustments
    if(data.service === 'noIncome'){ score -= 5; } // less strict on income
    if(data.service === 'mortgage'){ // mortgage expects better history
      if(data.delays !== 'none') score -= 18;
      if(Number(data.income) < 100000) score -= 10;
    }
    // small randomness
    score += (Math.random()*4 - 2);
    if(score < 2) score = 2;
    if(score > 98) score = 98 + Math.random()*2;
    return Math.round(score);
  }

  function interpret(score){
    if(score >= 75) return "Высокая вероятность одобрения";
    if(score >= 50) return "Средняя вероятность — есть нюансы";
    return "Низкая вероятность — нужны улучшения (доход, закрыть просрочки)";
  }

  calcBtn.addEventListener('click', function(){
    const fd = new FormData(form);
    const data = {};
    for (const pair of fd.entries()){ data[pair[0]] = pair[1]; }
    const score = computeScore(data);
    resultPercent.textContent = score + '%';
    resultText.textContent = interpret(score);
    resultBlock.style.display = 'block';

    // prepare WhatsApp link with summary
    const short = encodeURIComponent('Заявка: '+(data.service||'Общая')+'; ФИО: '+(data.name||'—')+'; Тел: '+(data.phone||'—')+'; Город: '+(data.city||'—')+'; Сумма: '+(data.amount||'—')+'; Рейтинг: '+score+'%');
    sendWhats.href = 'https://wa.me/77052606667?text='+short;
    sendWhats.setAttribute('target','_blank');
  });

  // allow clicking the send button (in case)
  sendWhats.addEventListener('click', function(){
    // just close modal when user goes to WhatsApp
    closeModal();
  });
})();
