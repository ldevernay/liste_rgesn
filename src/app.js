(function(){
  "use strict";

  var PAGE_SIZE = 10;

  var state = {data: [], filtered: [], page: 1};
  var els = {
    search: document.getElementById("f-search"),
    version: document.getElementById("f-version"),
    justif: document.getElementById("f-justif"),
    audit: document.getElementById("f-audit"),
    score: document.getElementById("f-score"),
    scoreOut: document.getElementById("f-score-out"),
    sort: document.getElementById("f-sort"),
    results: document.getElementById("results"),
    meta: document.getElementById("results-meta"),
    form: document.getElementById("filter-form"),
    pagination: document.getElementById("pagination")
  };

  function scoreBand(score){
    if (score === null || score === undefined) return "";
    if (score < 50) return "low";
    if (score < 75) return "mid";
    return "";
  }

  function parseFrDate(str){
    if (!str) return null;
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str.trim());
    if (!m) return null;
    return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime();
  }

  function esc(str){
    var d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  function applyFilters(){
    var q = els.search.value.trim().toLowerCase();
    var version = els.version.value;
    var justif = els.justif.value;
    var audit = els.audit.value;
    var minScore = Number(els.score.value);
    var sort = els.sort.value;

    var list = state.data.filter(function(d){
      if (q && d.organisme.toLowerCase().indexOf(q) === -1) return false;
      if (version && d.version !== version) return false;
      if (justif && d.justifications !== justif) return false;
      if (audit && d.audit !== audit) return false;
      if (d.score !== null && d.score < minScore) return false;
      if (d.score === null && minScore > 0) return false;
      return true;
    });

    list.sort(function(a, b){
      switch(sort){
        case "score-asc":
          return (a.score === null ? -1 : a.score) - (b.score === null ? -1 : b.score);
        case "organisme-asc":
          return a.organisme.localeCompare(b.organisme, "fr");
        case "organisme-desc":
          return b.organisme.localeCompare(a.organisme, "fr");
        case "maj-desc":
          return (parseFrDate(b.derniere_maj) || 0) - (parseFrDate(a.derniere_maj) || 0);
        case "maj-asc":
          return (parseFrDate(a.derniere_maj) || 0) - (parseFrDate(b.derniere_maj) || 0);
        case "score-desc":
        default:
          return (b.score === null ? -1 : b.score) - (a.score === null ? -1 : a.score);
      }
    });

    state.filtered = list;
  }

  function totalPages(){
    return Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
  }

  function renderCards(){
    var pageItems = state.filtered.slice(
      (state.page - 1) * PAGE_SIZE,
      state.page * PAGE_SIZE
    );

    if (state.filtered.length === 0){
      els.results.innerHTML = "";
      var li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Aucune déclaration ne correspond à ces filtres.";
      els.results.appendChild(li);
      return;
    }

    var html = pageItems.map(function(d){
      var scoreText = d.score === null ? "N/A" : (d.score % 1 === 0 ? d.score.toFixed(0) : d.score.toFixed(1)) + "%";
      var band = scoreBand(d.score);
      return (
        '<li class="card">' +
          '<div class="card-top">' +
            '<h2><a href="' + esc(d.url) + '" target="_blank" rel="noopener">' + esc(d.organisme) + '</a></h2>' +
            '<span class="score"' + (band ? ' data-band="' + band + '"' : '') + '>' +
              '<span class="sr-only">Score obtenu : </span>' + esc(scoreText) +
            '</span>' +
          '</div>' +
          '<p class="card-url"><a href="' + esc(d.url) + '" target="_blank" rel="noopener">' + esc(d.url) + '</a></p>' +
          '<ul class="tags">' +
            '<li>Référentiel ' + esc(d.version) + '</li>' +
            '<li' + (d.justifications === "Oui" ? ' data-true' : ' data-false') + '>Justifications : ' + esc(d.justifications) + '</li>' +
            '<li' + (d.audit === "Oui" ? ' data-true' : (d.audit === "Non" ? ' data-false' : '')) + '>Audit tiers : ' + esc(d.audit) + '</li>' +
            '<li>Mis à jour : ' + esc(d.derniere_maj || "N/A") + '</li>' +
          '</ul>' +
        '</li>'
      );
    }).join("");

    els.results.innerHTML = html;
  }

  function renderPagination(){
    var pages = totalPages();
    els.pagination.innerHTML = "";

    if (state.filtered.length === 0){
      return;
    }

    function makeBtn(label, page, opts){
      opts = opts || {};
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      if (opts.disabled) btn.disabled = true;
      if (opts.current) btn.setAttribute("aria-current", "page");
      if (opts.ariaLabel) btn.setAttribute("aria-label", opts.ariaLabel);
      btn.addEventListener("click", function(){
        state.page = page;
        renderCards();
        renderPagination();
        els.results.scrollIntoView({behavior: "smooth", block: "start"});
      });
      return btn;
    }

    els.pagination.appendChild(makeBtn("‹ Précédent", state.page - 1, {
      disabled: state.page <= 1, ariaLabel: "Page précédente"
    }));

    var windowSize = 1;
    var shown = [];
    for (var p = 1; p <= pages; p++){
      if (p === 1 || p === pages || Math.abs(p - state.page) <= windowSize){
        shown.push(p);
      }
    }

    var prev = null;
    shown.forEach(function(p){
      if (prev !== null && p - prev > 1){
        var span = document.createElement("span");
        span.className = "ellipsis";
        span.textContent = "…";
        span.setAttribute("aria-hidden", "true");
        els.pagination.appendChild(span);
      }
      els.pagination.appendChild(makeBtn(String(p), p, {
        current: p === state.page,
        ariaLabel: "Page " + p
      }));
      prev = p;
    });

    els.pagination.appendChild(makeBtn("Suivant ›", state.page + 1, {
      disabled: state.page >= pages, ariaLabel: "Page suivante"
    }));
  }

  function renderMeta(){
    var total = state.filtered.length;
    var pages = totalPages();
    var from = total === 0 ? 0 : (state.page - 1) * PAGE_SIZE + 1;
    var to = Math.min(state.page * PAGE_SIZE, total);
    els.meta.textContent = total === 0
      ? "Aucune déclaration affichée sur " + state.data.length + "."
      : from + "–" + to + " sur " + total + " déclaration" + (total !== 1 ? "s" : "") +
        " (page " + state.page + "/" + pages + "), " + state.data.length + " au total.";
  }

  function render(resetPage){
    applyFilters();
    if (resetPage) state.page = 1;
    if (state.page > totalPages()) state.page = totalPages();
    renderCards();
    renderPagination();
    renderMeta();
  }

  function populateVersionOptions(){
    var versions = Array.from(new Set(state.data.map(function(d){ return d.version; })))
      .filter(Boolean)
      .sort();
    versions.forEach(function(v){
      var opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      els.version.appendChild(opt);
    });
  }

  ["input", "change"].forEach(function(evt){
    els.search.addEventListener(evt, function(){ render(true); });
    els.version.addEventListener(evt, function(){ render(true); });
    els.justif.addEventListener(evt, function(){ render(true); });
    els.audit.addEventListener(evt, function(){ render(true); });
    els.sort.addEventListener(evt, function(){ render(true); });
  });
  els.score.addEventListener("input", function(){
    els.scoreOut.textContent = els.score.value;
    render(true);
  });

  els.form.addEventListener("reset", function(){
    window.setTimeout(function(){
      els.scoreOut.textContent = "0";
      render(true);
    }, 0);
  });

  fetch(new URL("asset:./declarations.json", import.meta.url))
    .then(function(r){
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function(data){
      state.data = data;
      populateVersionOptions();
      render(true);
    })
    .catch(function(err){
      els.meta.textContent = "Impossible de charger les données (declarations.json).";
      console.error(err);
    });

  if ("serviceWorker" in navigator){
    window.addEventListener("load", function(){
      navigator.serviceWorker.register(new URL("./sw.js", import.meta.url))
        .catch(function(err){
          console.error("Échec de l'enregistrement du service worker :", err);
        });
    });
  }
})();
