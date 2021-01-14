import Component from '@ember/component';
import { action } from '@ember/object';
import { or, readOnly } from '@ember/object/computed';
import { later, cancel } from '@ember/runloop';
import { inject as service } from '@ember/service';

import createFocusTrap from 'focus-trap';

import layout from '../templates/components/modal';

export default Component.extend({
  layout,

  tagName: '',
  outAnimationClass: 'epm-out',
  result: undefined,

  modals: service(),

  outAnimationTimeout: or('modal._service.outAnimationTimeout', 'modal._options.timeout'),
  optionsClassName: readOnly('modal._options.className'),

  didInsertElement() {
    this._super(...arguments);

    let { focusTrapOptions: options } = this.modals;

    options = Object.assign({}, options, {
      fallbackFocus: `#${this.elementId}`,
      onDeactivate: () => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        this.closeModal();
      },
    });

    this.focusTrap = createFocusTrap(this.element, options);
    this.focusTrap.activate();

    this.fadeOutEnd = ({ target, animationName }) => {
      this.modals._onModalAnimationEnd();

      let isntTarget = target !== this.element;
      let wrongAnimation = this.modal._options.animationName && this.modal._options.animationName !== animationName;
      let animationEndsWrong = animationName.substring(animationName.length - 4) !== '-out';

      if (isntTarget || wrongAnimation || animationEndsWrong) {
        return;
      }

      this.removeModal();
    };

    this.modals._onModalAnimationStart();
    this.element.addEventListener('animationend', this.fadeOutEnd);
    this.set('animatingOutClass', '');
  },

  willDestroyElement() {
    if (this.focusTrap) {
      this.focusTrap.deactivate({ onDeactivate: null });
    }

    if (this.fadeOutEnd) {
      this.element.removeEventListener('animationend', this.fadeOutEnd);
    }

    this._super(...arguments);
  },

  closeModal(result) {
    this._timeout = later(() => {
      this.removeModal();
    }, this.outAnimationTimeout);

    this.set('result', result);
    this.set('animatingOutClass', this.outAnimationClass);

    if (this.focusTrap) {
      this.focusTrap.deactivate({ onDeactivate: null });
    }
  },

  removeModal() {
    cancel(this._timeout);

    this.modal.close(this.result);

    this.set('animatingOutClass', '');
  },

  close: action(function (result) {
    this.closeModal(result);
  }),
});
