/**
 * Field types for the editor extension.
 */

import {
  html,
  FieldType,
} from 'selective-edit'
import {
  MDCSwitch
} from '@material/switch/index'
import {
  MDCRipple
} from '@material/ripple/index'


export const partialsFieldType = new FieldType('partials', {
  uiCallback: (element) => {
    const fieldUi = {}

    const partialSelectEl = element.querySelector('.mdc-select')
    // TODO: Gives error about the navtive element.
    // fieldUi['partialSelect'] = new MDCSwitch(partialSelectEl)

    const addEl = element.querySelector('.mdc-button')
    fieldUi['addButton'] = new MDCRipple(addEl)

    return fieldUi
  },
}, (id, label, value, options) => html`<div class="field field__partials">
  <div class="partials">
    <div class="partials__label"></div>
    <div class="partials__items">
      <div class="partials__list" id="${id}"></div>
      <div class="partials__add">
        <div class="mdc-select mdc-select--outlined">
          <div class="mdc-select__anchor">
            <i class="mdc-select__dropdown-icon"></i>
            <div id="demo-selected-text" class="mdc-select__selected-text" aria-labelledby="outlined-select-label"></div>
            <div class="mdc-notched-outline">
              <div class="mdc-notched-outline__leading"></div>
              <div class="mdc-notched-outline__notch">
                <label id="outlined-select-label" class="mdc-floating-label">${options['addLabel'] || label}</label>
              </div>
              <div class="mdc-notched-outline__trailing"></div>
            </div>
          </div>
<!--
          <div class="mdc-select__menu mdc-menu mdc-menu-surface" role="listbox">
            <ul class="mdc-list">
              <li class="mdc-list-item mdc-list-item--selected" data-value="" role="option"></li>
            </ul>
          </div>
 -->
        </div>

        <button class="mdc-button mdc-button--outlined">
          <div class="mdc-button__ripple"></div>
          <i class="material-icons mdc-button__icon" aria-hidden="true">add</i>
          <span class="mdc-button__label">Add</span>
        </button>
      </div>
    </div>
  </div>
</div>`)


export const defaultFieldTypes = [
  partialsFieldType,
]
