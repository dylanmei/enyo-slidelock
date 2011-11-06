(function() {
  var slider = {
    name: 'SlideLock',
    kind: enyo.Stateful,
    className: 'slidelock', cssNamespace: 'slidelock',
    published: { caption: '', unlocked: false, sliding: false },
    events: { onSliding: '', onCancel: '', onUnlock: '' },
    chrome: [
      { name: 'button', kind: 'SlideButton' },
      { name: 'caption', className: 'slidelock-caption', showing: false}
    ],

    create: function() {
      this.inherited(arguments);
      this.caption = this.caption || this.label || this.content;
      this.captionChanged();
    },

    captionChanged: function() {
      this.$.caption.setContent(this.caption);
      this.$.caption.setShowing(this.caption);
    },

    unlockedChanged: function() {
      this.stateChanged('unlocked');
    },

    slidingChanged: function() {
      this.stateChanged('sliding');
    },

    calculateBounds: function() {
      this.slide_bounds = this.slide_bounds || {
        left: this.$.button.hasNode().offsetLeft,
        width: this.$.button.hasNode().offsetWidth
      };
      this.slide_bounds.right = this.slide_bounds.left + this.hasNode().offsetWidth;
      return this.slide_bounds;
    },

    dragstartHandler: function(sender, e) {
      if (this.canDrag(e)) {
        this.$.button.grab();
        this.setSliding(true);
        this.doSliding();
      }
    },

    canDrag: function(e) {
      var target = e.dispatchTarget;
      return (!this.unlocked && e.horizontal &&
        target == this.$.button || target.owner == this.$.button);
    },

    dragHandler: function(sender, e) {
      if (!this.sliding || !e.horizontal) return;
      var bounds = this.calculateBounds();
      var newX = bounds.left + e.dx;

      if (newX < bounds.left) return;
      if (newX + bounds.width > bounds.right) return;
      
      this.$.button.slide(newX);
    },

    dragfinishHandler: function(sender, e) {
      if (!this.sliding) return;

      var bounds = this.calculateBounds();
      var newX = bounds.left + e.dx;
      var autofinish = bounds.right - (bounds.width * 0.25);
      if (newX + bounds.width > autofinish) {
        this.$.button.snap(bounds.right);
        this.unlock();
      }
      else {
        this.cancel();
      }
    },
    cancel: function() {
      this.$.button.recoil();
      this.setSliding(false);
      this.doCancel();
    },
    unlock: function() {
      this.setSliding(false);
      this.setUnlocked(true);
      this.doUnlock();
    }
  };

  var button = {
    name: 'SlideButton',
    kind: enyo.CustomButton,
    className: 'slidelock-button',
    cssNamespace: 'slidelock-button',
    slidingHandler: true,
    allowDrag: true,
    components: [
      {name: "symbol", className: 'slidelock-button-symbol'},
    ],
    grab: function() {
      this.setDown(true);
      this.removeClass('slidelock-button-recoil');
      var node = this.hasNode();
      node.style.webkitTransform = 'translate3d(0,0,0)';
    },
    slide: function(x) {
      var node = this.hasNode();
      node.style.webkitTransform = 'translate3d(' + x + 'px, 0, 0)';    
    },
    snap: function(x) {
      var node = this.hasNode();
      node.style.webkitTransform = 'translate3d(' + (x - node.offsetWidth) + 'px,0,0)';
    },
    recoil: function() {
      var node = this.hasNode();
      node.style.webkitTransform = '';
      this.addClass('slidelock-button-recoil');
    }
  };

  enyo.kind(button);
  enyo.kind(slider);
})();