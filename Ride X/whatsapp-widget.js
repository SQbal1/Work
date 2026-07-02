(function () {
  function initWhatsAppWidget() {
    var float = document.querySelector(".whatsapp-float");
    if (!float || float.closest(".whatsapp-widget")) return;

    var widget = document.createElement("div");
    widget.className = "whatsapp-widget";
    float.parentNode.insertBefore(widget, float);
    widget.appendChild(float);

    var dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "whatsapp-dismiss";
    dismiss.setAttribute("aria-label", "Hide WhatsApp button (reload the page to bring it back)");
    dismiss.setAttribute("data-tip", "Remove icon (temporary — refresh to bring it back)");
    dismiss.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    widget.appendChild(dismiss);

    function hideWidget() {
      widget.classList.add("is-removed");
      window.setTimeout(function () { widget.style.display = "none"; }, 200);
    }

    dismiss.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      hideWidget();
    });

    var hideTimer = null;
    function showDismiss() {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      widget.classList.add("show-dismiss");
    }
    function scheduleHideDismiss() {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = window.setTimeout(function () {
        widget.classList.remove("show-dismiss");
      }, 160);
    }
    if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
      float.addEventListener("mouseenter", showDismiss);
      float.addEventListener("mouseleave", scheduleHideDismiss);
      dismiss.addEventListener("mouseenter", showDismiss);
      dismiss.addEventListener("mouseleave", scheduleHideDismiss);
      dismiss.addEventListener("focus", showDismiss);
      dismiss.addEventListener("blur", scheduleHideDismiss);
    }

    var LONG_PRESS_MS = 450, MOVE_CANCEL = 12;
    var trash = null, longPressTimer = null, dragging = false, draggedThisTouch = false;
    var startX = 0, startY = 0;

    function ensureTrash() {
      if (trash) return trash;
      trash = document.createElement("div");
      trash.className = "whatsapp-trash";
      trash.setAttribute("aria-hidden", "true");
      trash.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>';
      document.body.appendChild(trash);
      return trash;
    }

    function overTrash(x, y) {
      if (!trash) return false;
      var r = trash.getBoundingClientRect(), pad = 28;
      return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
    }

    function startDrag() {
      dragging = true; draggedThisTouch = true;
      ensureTrash();
      trash.classList.add("is-visible");
      widget.classList.add("is-dragging");
      if (navigator.vibrate) { try { navigator.vibrate(15); } catch (e) {} }
    }

    function moveDrag(x, y) {
      float.style.left = x + "px"; float.style.top = y + "px";
      if (overTrash(x, y)) trash.classList.add("is-armed");
      else trash.classList.remove("is-armed");
    }

    function endDrag(x, y) {
      var drop = x >= 0 && overTrash(x, y);
      widget.classList.remove("is-dragging");
      float.style.left = ""; float.style.top = "";
      if (trash) { trash.classList.remove("is-visible"); trash.classList.remove("is-armed"); }
      dragging = false;
      if (drop) hideWidget();
    }

    float.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      draggedThisTouch = false;
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
      longPressTimer = window.setTimeout(function () {
        longPressTimer = null; startDrag(); moveDrag(startX, startY);
      }, LONG_PRESS_MS);
    }, { passive: true });

    float.addEventListener("touchmove", function (e) {
      var t = e.touches[0];
      if (dragging) { e.preventDefault(); moveDrag(t.clientX, t.clientY); return; }
      if (longPressTimer && (Math.abs(t.clientX - startX) > MOVE_CANCEL || Math.abs(t.clientY - startY) > MOVE_CANCEL)) {
        clearTimeout(longPressTimer); longPressTimer = null;
      }
    }, { passive: false });

    function finishTouch(e) {
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      if (dragging) {
        var t = e.changedTouches && e.changedTouches[0];
        if (t) endDrag(t.clientX, t.clientY); else endDrag(-1, -1);
      }
    }
    float.addEventListener("touchend", finishTouch);
    float.addEventListener("touchcancel", finishTouch);

    float.addEventListener("click", function (e) {
      if (draggedThisTouch) { e.preventDefault(); e.stopPropagation(); draggedThisTouch = false; }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWhatsAppWidget);
  } else {
    initWhatsAppWidget();
  }
})();
