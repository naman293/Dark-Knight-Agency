/* pricing.js – tier tab switching */

(function() {
  const tabs   = document.querySelectorAll('.pricing-tab');
  const panels = document.querySelectorAll('.pricing-panel');

  const colorMap = {
    starter: 'active-green',
    growth:  'active-blue',
    premium: 'active-purple',
    elite:   'active-red',
  };

  function showTier(tier) {
    tabs.forEach(t => {
      t.classList.remove('active-green', 'active-blue', 'active-purple', 'active-red');
    });
    panels.forEach(p => p.classList.remove('active'));

    const activeTab   = document.querySelector(`[data-tier="${tier}"]`);
    const activePanel = document.getElementById(`pricing-panel-${tier}`);

    if (activeTab)   activeTab.classList.add(colorMap[tier]);
    if (activePanel) activePanel.classList.add('active');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      showTier(tab.dataset.tier);
    });
  });

  // Init
  showTier('starter');
})();
