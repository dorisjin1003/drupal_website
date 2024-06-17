/**
 * @file
 * JavaScript behaviors for jquery.inputmask integration.
 */

(function ($, Drupal, once) {

  'use strict';

  // Revert: Set currency prefix to empty by default #2066.
  // @see https://github.com/RobinHerbots/Inputmask/issues/2066
  if (window.Inputmask) {
    window.Inputmask.extendAliases({
      currency: {
        prefix: '$ ',
        groupSeparator: ',',
        alias: 'numeric',
        placeholder: '0',
        autoGroup: true,
        digits: 2,
        digitsOptional: false,
        clearMaskOnLostFocus: false
      },
      currency_negative: {
        prefix: '$ ',
        groupSeparator: ',',
        alias: 'numeric',
        placeholder: '0',
        autoGroup: true,
        digits: 2,
        digitsOptional: false,
        clearMaskOnLostFocus: false
      },
      currency_positive_negative: {
        prefix: '$ ',
        groupSeparator: ',',
        alias: 'numeric',
        placeholder: '0',
        autoGroup: true,
        digits: 2,
        digitsOptional: false,
        clearMaskOnLostFocus: false
      }
    });
  }

  /**
   * Initialize input masks.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformInputMask = {
    attach: function (context) {
      if (!$.fn.inputmask) {
        return;
      }

      $(once('webform-input-mask', 'input.js-webform-input-mask', context)).inputmask();
    }
  };

})(jQuery, Drupal, once);
;
/**
 * @file
 * JavaScript behaviors for checkboxes.
 */

(function ($, Drupal, once) {

  'use strict';

  /**
   * Adds check all or none checkboxes support.
   *
   * @type {Drupal~behavior}
   *
   * @see https://www.drupal.org/project/webform/issues/3068998
   */
  Drupal.behaviors.webformCheckboxesAllorNone = {
    attach: function (context) {
      $(once('webform-checkboxes-all-or-none', '[data-options-all], [data-options-none]', context))
        .each(function () {
          var $element = $(this);

          var options_all_value = $element.data('options-all');
          var options_none_value = $element.data('options-none');

          // Get all checkboxes.
          var $checkboxes = $element.find('input[type="checkbox"]');

          // Get all options/checkboxes.
          var $options = $checkboxes
            .not('[value="' + options_all_value + '"]')
            .not('[value="' + options_none_value + '"]');

          // Get options all and none checkboxes.
          var $options_all = $element
            .find(':checkbox[value="' + options_all_value + '"]');
          var $options_none = $element
            .find(':checkbox[value="' + options_none_value + '"]');

          // All of the above.
          if ($options_all.length) {
            $options_all.on('click', toggleCheckAllEventHandler);
            if ($options_all.prop('checked')) {
              toggleCheckAllEventHandler();
            }
          }

          // None of the above.
          if ($options_none.length) {
            $options_none.on('click', toggleCheckNoneEventHandler);
            toggleCheckNoneEventHandler();
          }

          $options.on('click', toggleCheckboxesEventHandler);
          toggleCheckboxesEventHandler();

          /**
           * Toggle check all checkbox checked state.
           */
          function toggleCheckAllEventHandler() {
            if ($options_all.prop('checked')) {
              // Uncheck options none.
              if ($options_none.is(':checked')) {
                $options_none
                  .prop('checked', false)
                  .trigger('change', ['webform.states']);
              }
              // Check check all unchecked options.
              $options.not(':checked')
                .prop('checked', true)
                .trigger('change', ['webform.states']);
            }
            else {
              // Check uncheck all checked options.
              $options.filter(':checked')
                .prop('checked', false)
                .trigger('change', ['webform.states']);
            }
          }

          /**
           * Toggle check none checkbox checked state.
           */
          function toggleCheckNoneEventHandler() {
            if ($options_none.prop('checked')) {
              $checkboxes
                .not('[value="' + options_none_value + '"]')
                .filter(':checked')
                .prop('checked', false)
                .trigger('change', ['webform.states']);
            }
          }

          /**
           * Toggle check all checkbox checked state.
           */
          function toggleCheckboxesEventHandler() {
            var isAllChecked = ($options.filter(':checked').length === $options.length);
            if ($options_all.length
              && $options_all.prop('checked') !== isAllChecked) {
              $options_all
                .prop('checked', isAllChecked)
                .trigger('change', ['webform.states']);
            }
            var isOneChecked = $options.is(':checked');
            if ($options_none.length
              && isOneChecked) {
              $options_none
                .prop('checked', false)
                .trigger('change', ['webform.states']);
            }
          }
        });
    }
  };

})(jQuery, Drupal, once);
;
/**
 * @file
 * JavaScript behaviors for other elements.
 */

(function ($, Drupal, once) {

  'use strict';

  /**
   * Toggle other input (text) field.
   *
   * @param {boolean} show
   *   TRUE will display the text field. FALSE with hide and clear the text field.
   * @param {object} $element
   *   The input (text) field to be toggled.
   * @param {string} effect
   *   Effect.
   */
  function toggleOther(show, $element, effect) {
    var $input = $element.find('input');
    var hideEffect = (effect === false) ? 'hide' : 'slideUp';
    var showEffect = (effect === false) ? 'show' : 'slideDown';

    if (show) {
      // Limit the other inputs width to the parent's container.
      // If the parent container is not visible it's width will be 0
      // and ignored.
      var width = $element.parent().width();
      if (width) {
        $element.width(width);
      }

      // Display the element.
      $element[showEffect]();
      // If not initializing, then focus the other element.
      if (effect !== false) {
        $input.trigger('focus');
      }
      // Require the input.
      $input.prop('required', true).attr('aria-required', 'true');
      // Restore the input's value.
      var value = $input.data('webform-value');
      if (typeof value !== 'undefined') {
        $input.val(value);
        var input = $input.get(0);
        // Move cursor to the beginning of the other text input.
        // @see https://stackoverflow.com/questions/21177489/selectionstart-selectionend-on-input-type-number-no-longer-allowed-in-chrome
        if ($.inArray(input.type, ['text', 'search', 'url', 'tel', 'password']) !== -1) {
          input.setSelectionRange(0, 0);
        }
      }
      // Refresh CodeMirror used as other element.
      $element.parent().find('.CodeMirror').each(function (index, $element) {
        $element.CodeMirror.refresh();
      });
    }
    else {
      // Hide the element.
      $element[hideEffect]();
      // Save the input's value.
      if ($input.val() !== '') {
        $input.data('webform-value', $input.val());
      }
      // Empty and un-required the input.
      $input.val('').prop('required', false).removeAttr('aria-required');
    }
  }

  /**
   * Attach handlers to select other elements.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformSelectOther = {
    attach: function (context) {
      $(once('webform-select-other', '.js-webform-select-other', context)).each(function () {
        var $element = $(this);

        var $select = $element.find('select');
        var $input = $element.find('.js-webform-select-other-input');

        $select.on('change', function () {
          var isOtherSelected = $select
            .find('option[value="_other_"]')
            .is(':selected');
          toggleOther(isOtherSelected, $input);
        });

        var isOtherSelected = $select
          .find('option[value="_other_"]')
          .is(':selected');
        toggleOther(isOtherSelected, $input, false);
      });
    }
  };

  /**
   * Attach handlers to checkboxes other elements.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformCheckboxesOther = {
    attach: function (context) {
      $(once('webform-checkboxes-other', '.js-webform-checkboxes-other', context)).each(function () {
        var $element = $(this);
        var $checkbox = $element.find('input[value="_other_"]');
        var $input = $element.find('.js-webform-checkboxes-other-input');

        $checkbox.on('change', function () {
          toggleOther(this.checked, $input);
        });

        toggleOther($checkbox.is(':checked'), $input, false);
      });
    }
  };

  /**
   * Attach handlers to radios other elements.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformRadiosOther = {
    attach: function (context) {
      $(once('webform-radios-other', '.js-webform-radios-other', context)).each(function () {
        var $element = $(this);

        var $radios = $element.find('input[type="radio"]');
        var $input = $element.find('.js-webform-radios-other-input');

        $radios.on('change', function () {
          toggleOther(($radios.filter(':checked').val() === '_other_'), $input);
        });

        toggleOther(($radios.filter(':checked').val() === '_other_'), $input, false);
      });
    }
  };

  /**
   * Attach handlers to buttons other elements.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformButtonsOther = {
    attach: function (context) {
      $(once('webform-buttons-other', '.js-webform-buttons-other', context)).each(function () {
        var $element = $(this);

        var $buttons = $element.find('input[type="radio"]');
        var $input = $element.find('.js-webform-buttons-other-input');
        var $container = $(this).find('.js-webform-webform-buttons');

        // Create set onchange handler.
        $container.on('change', function () {
          toggleOther(($(this).find(':radio:checked').val() === '_other_'), $input);
        });

        toggleOther(($buttons.filter(':checked').val() === '_other_'), $input, false);
      });
    }
  };

})(jQuery, Drupal, once);
;
/**
 * @file
 * JavaScript behaviors for options elements.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Attach handlers to options buttons element.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformOptionsButtons = {
    attach: function (context) {
      // Place <input> inside of <label> before the label.
      $(context).find('label.webform-options-display-buttons-label > input[type="checkbox"], label.webform-options-display-buttons-label > input[type="radio"]').each(function () {
        var $input = $(this);
        var $label = $input.parent();
        $input.detach().insertBefore($label);
      });
    }
  };

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for Likert element.
 */

(function ($, Drupal) {

  'use strict';

  $(document).on('state:required', function (e) {
    if (e.trigger && e.target && e.target.id) {
      var $element = $('#' + e.target.id);
      // Add/remove required from the question labels.
      if ($element.hasClass('webform-likert-table')) {
        if (e.value) {
          $element.find('tr td:first-child label').addClass('js-form-required form-required');
        }
        else {
          $element.find('tr td:first-child label').removeClass('js-form-required form-required');
        }
      }
    }
  });

})(jQuery, Drupal);
;
/**
 * @file
 * Sticky table headers.
 */

(function ($, Drupal, displace) {
  /**
   * Constructor for the tableHeader object. Provides sticky table headers.
   *
   * TableHeader will make the current table header stick to the top of the page
   * if the table is very long.
   *
   * @constructor Drupal.TableHeader
   *
   * @param {HTMLElement} table
   *   DOM object for the table to add a sticky header to.
   *
   * @listens event:columnschange
   */
  function TableHeader(table) {
    const $table = $(table);

    /**
     * @name Drupal.TableHeader#$originalTable
     *
     * @type {HTMLElement}
     */
    this.$originalTable = $table;

    /**
     * @type {jQuery}
     */
    this.$originalHeader = $table.children('thead');

    /**
     * @type {jQuery}
     */
    this.$originalHeaderCells = this.$originalHeader.find('> tr > th');

    /**
     * @type {null|boolean}
     */
    this.displayWeight = null;
    this.$originalTable.addClass('sticky-table');
    this.tableHeight = $table[0].clientHeight;
    this.tableOffset = this.$originalTable.offset();

    // React to columns change to avoid making checks in the scroll callback.
    this.$originalTable.on(
      'columnschange',
      { tableHeader: this },
      (e, display) => {
        const tableHeader = e.data.tableHeader;
        if (
          tableHeader.displayWeight === null ||
          tableHeader.displayWeight !== display
        ) {
          tableHeader.recalculateSticky();
        }
        tableHeader.displayWeight = display;
      },
    );

    // Create and display sticky header.
    this.createSticky();
  }

  // Helper method to loop through tables and execute a method.
  function forTables(method, arg) {
    const tables = TableHeader.tables;
    const il = tables.length;
    for (let i = 0; i < il; i++) {
      tables[i][method](arg);
    }
  }

  // Select and initialize sticky table headers.
  function tableHeaderInitHandler(e) {
    once('tableheader', $(e.data.context).find('table.sticky-enabled')).forEach(
      (table) => {
        TableHeader.tables.push(new TableHeader(table));
      },
    );
    forTables('onScroll');
  }

  /**
   * Attaches sticky table headers.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the sticky table header behavior.
   */
  Drupal.behaviors.tableHeader = {
    attach(context) {
      $(window).one(
        'scroll.TableHeaderInit',
        { context },
        tableHeaderInitHandler,
      );
    },
  };

  function scrollValue(position) {
    return document.documentElement[position] || document.body[position];
  }

  function tableHeaderResizeHandler(e) {
    forTables('recalculateSticky');
  }

  function tableHeaderOnScrollHandler(e) {
    forTables('onScroll');
  }

  function tableHeaderOffsetChangeHandler(e, offsets) {
    forTables('stickyPosition', offsets.top);
  }

  // Bind event that need to change all tables.
  $(window).on({
    /**
     * When resizing table width can change, recalculate everything.
     *
     * @ignore
     */
    'resize.TableHeader': tableHeaderResizeHandler,

    /**
     * Bind only one event to take care of calling all scroll callbacks.
     *
     * @ignore
     */
    'scroll.TableHeader': tableHeaderOnScrollHandler,
  });
  // Bind to custom Drupal events.
  $(document).on({
    /**
     * Recalculate columns width when window is resized, when show/hide weight
     * is triggered, or when toolbar tray is toggled.
     *
     * @ignore
     */
    'columnschange.TableHeader drupalToolbarTrayChange':
      tableHeaderResizeHandler,

    /**
     * Recalculate TableHeader.topOffset when viewport is resized.
     *
     * @ignore
     */
    'drupalViewportOffsetChange.TableHeader': tableHeaderOffsetChangeHandler,
  });

  /**
   * Store the state of TableHeader.
   */
  $.extend(
    TableHeader,
    /** @lends Drupal.TableHeader */ {
      /**
       * This will store the state of all processed tables.
       *
       * @type {Array.<Drupal.TableHeader>}
       */
      tables: [],
    },
  );

  /**
   * Extend TableHeader prototype.
   */
  $.extend(
    TableHeader.prototype,
    /** @lends Drupal.TableHeader# */ {
      /**
       * Minimum height in pixels for the table to have a sticky header.
       *
       * @type {number}
       */
      minHeight: 100,

      /**
       * Absolute position of the table on the page.
       *
       * @type {?Drupal~displaceOffset}
       */
      tableOffset: null,

      /**
       * Absolute position of the table on the page.
       *
       * @type {?number}
       */
      tableHeight: null,

      /**
       * Boolean storing the sticky header visibility state.
       *
       * @type {boolean}
       */
      stickyVisible: false,

      /**
       * Create the duplicate header.
       */
      createSticky() {
        // For caching purposes.
        this.$html = $('html');
        // Clone the table header so it inherits original jQuery properties.
        const $stickyHeader = this.$originalHeader.clone(true);
        // Hide the table to avoid a flash of the header clone upon page load.
        this.$stickyTable = $('<table class="sticky-header"></table>')
          .css({
            visibility: 'hidden',
            position: 'fixed',
            top: '0px',
          })
          .append($stickyHeader)
          .insertBefore(this.$originalTable);

        this.$stickyHeaderCells = $stickyHeader.find('> tr > th');

        // Initialize all computations.
        this.recalculateSticky();
      },

      /**
       * Set absolute position of sticky.
       *
       * @param {number} offsetTop
       *   The top offset for the sticky header.
       * @param {number} offsetLeft
       *   The left offset for the sticky header.
       *
       * @return {jQuery}
       *   The sticky table as a jQuery collection.
       */
      stickyPosition(offsetTop, offsetLeft) {
        const css = {};
        if (typeof offsetTop === 'number') {
          css.top = `${offsetTop}px`;
        }
        if (typeof offsetLeft === 'number') {
          css.left = `${this.tableOffset.left - offsetLeft}px`;
        }
        this.$html.css(
          'scroll-padding-top',
          displace.offsets.top +
            (this.stickyVisible ? this.$stickyTable.height() : 0),
        );
        return this.$stickyTable.css(css);
      },

      /**
       * Returns true if sticky is currently visible.
       *
       * @return {boolean}
       *   The visibility status.
       */
      checkStickyVisible() {
        const scrollTop = scrollValue('scrollTop');
        const tableTop = this.tableOffset.top - displace.offsets.top;
        const tableBottom = tableTop + this.tableHeight;
        let visible = false;

        if (tableTop < scrollTop && scrollTop < tableBottom - this.minHeight) {
          visible = true;
        }

        this.stickyVisible = visible;
        return visible;
      },

      /**
       * Check if sticky header should be displayed.
       *
       * This function is throttled to once every 250ms to avoid unnecessary
       * calls.
       *
       * @param {jQuery.Event} e
       *   The scroll event.
       */
      onScroll(e) {
        this.checkStickyVisible();
        // Track horizontal positioning relative to the viewport.
        this.stickyPosition(null, scrollValue('scrollLeft'));
        this.$stickyTable.css(
          'visibility',
          this.stickyVisible ? 'visible' : 'hidden',
        );
      },

      /**
       * Event handler: recalculates position of the sticky table header.
       *
       * @param {jQuery.Event} event
       *   Event being triggered.
       */
      recalculateSticky(event) {
        // Update table size.
        this.tableHeight = this.$originalTable[0].clientHeight;

        // Update offset top.
        displace.offsets.top = displace.calculateOffset('top');
        this.tableOffset = this.$originalTable.offset();
        this.stickyPosition(displace.offsets.top, scrollValue('scrollLeft'));

        // Update columns width.
        let $that = null;
        let $stickyCell = null;
        let display = null;
        // Resize header and its cell widths.
        // Only apply width to visible table cells. This prevents the header from
        // displaying incorrectly when the sticky header is no longer visible.
        const il = this.$originalHeaderCells.length;
        for (let i = 0; i < il; i++) {
          $that = $(this.$originalHeaderCells[i]);
          $stickyCell = this.$stickyHeaderCells.eq($that.index());
          display = $that.css('display');
          if (display !== 'none') {
            $stickyCell.css({ width: $that.css('width'), display });
          } else {
            $stickyCell.css('display', 'none');
          }
        }
        this.$stickyTable.css('width', this.$originalTable.outerWidth());
      },
    },
  );

  // Expose constructor in the public space.
  Drupal.TableHeader = TableHeader;
})(jQuery, Drupal, window.Drupal.displace);
;
