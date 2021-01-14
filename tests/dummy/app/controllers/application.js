import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  modals: service(),

  flip: false,

  showModal: action(function (options) {
    this.modals.open('modal1', undefined, options);
    this.toggleProperty('flip');
  }),
});
