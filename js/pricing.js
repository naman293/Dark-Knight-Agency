/* pricing.js – tier tab switching */

(function() {
  const tabs   = document.querySelectorAll('.pricing-tab');
  const panels = document.querySelectorAll('.pricing-panel');

  const colorMap = {
    spark:      'active-green',
    growth:     'active-blue',
    automate:   'active-purple',
    scale:      'active-red',
    enterprise: 'active-gold',
  };

  function showTier(tier) {
    tabs.forEach(t => {
      t.classList.remove('active-green', 'active-blue', 'active-purple', 'active-red', 'active-gold');
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
  showTier('spark');
})();
