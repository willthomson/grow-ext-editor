/**
 * Standard field types for the editor extension.
 */

import {
  html,
  repeat,
  Field,
} from 'selective-edit'
import {
  findParentByClassname,
  inputFocusAtEnd,
} from '../../utility/dom'
import pell from 'pell'
import showdown from 'showdown'


export class CheckboxField extends Field {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this.fieldType = 'checkbox'

    this.template = (selective, field, data) => html`<div
        class="selective__field selective__field__${field.fieldType} ${field.valueFromData(data) ? 'selective__field__checkbox--checked' : ''}"
        data-field-type="${field.fieldType}" @click=${field.handleInput.bind(field)}>
      <div class="selective__field__checkbox__label">${field.label}</div>
      <i class="material-icons">${this.value ? 'check_box' : 'check_box_outline_blank'}</i>
      ${field.renderHelp(selective, field, data)}
    </div>`
  }

  handleInput(evt) {
    this.value = !this.value
    document.dispatchEvent(new CustomEvent('selective.render'))
  }
}

export class DateField extends Field {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this.fieldType = 'date'

    this.template = (selective, field, data) => html`<div class="selective__field selective__field__${field.fieldType}" data-field-type="${field.fieldType}">
      <label for="${field.getUid()}">${field.label}</label>
      <input
          id="${field.getUid()}"
          type="date"
          placeholder="${field.placeholder}"
          @input=${field.handleInput.bind(field)}
          value=${field.valueFromData(data) || ''} />
      ${field.renderHelp(selective, field, data)}
    </div>`
  }
}

export class DateTimeField extends Field {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this.fieldType = 'datetime'

    this.template = (selective, field, data) => html`<div class="selective__field selective__field__${field.fieldType}" data-field-type="${field.fieldType}">
      <label for="${field.getUid()}">${field.label}</label>
      <input
          id="${field.getUid()}"
          type="datetime-local"
          placeholder="${field.placeholder}"
          @input=${field.handleInput.bind(field)}
          value=${field.valueFromData(data) || ''} />
      ${field.renderHelp(selective, field, data)}
    </div>`
  }
}

export class HtmlField extends Field {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this.fieldType = 'html'

    this.template = (selective, field, data) => html`<div class="selective__field selective__field__${field.fieldType}" data-field-type="${field.fieldType}">
      <label for="${field.getUid()}">${field.label}</label>
      <div id="${field.getUid()}" class="pell">${field.updateFromData(data)}</div>
      ${field.renderHelp(selective, field, data)}
    </div>`
  }

  postRender(containerEl) {
    const actions = this.getConfig().get('pellActions', [
      'bold', 'italic', 'heading1', 'heading2', 'olist', 'ulist', 'link'])
    const fieldInstances = containerEl.querySelectorAll('.selective__field__html')
    for (const fieldInstance of fieldInstances) {
      if (!fieldInstance.pellEditor) {
        const pellEl = fieldInstance.querySelector('.pell')

        fieldInstance.pellEditor = pell.init({
          element: pellEl,
          actions: actions,
          onChange: (html) => {
            this.value = html
            document.dispatchEvent(new CustomEvent('selective.render'))
          }
        })
      }

      if (this.isClean) {
        fieldInstance.pellEditor.content.innerHTML = this.value || ''
      }
    }
  }
}

export class MarkdownField extends Field {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this.fieldType = 'markdown'
    this.showdown = new showdown.Converter()

    this.template = (selective, field, data) => html`<div class="selective__field selective__field__${field.fieldType}" data-field-type="${field.fieldType}">
      <label for="${field.getUid()}">${field.label}</label>
      <div id="${field.getUid()}" class="pell">${field.updateFromData(data)}</div>
      ${field.renderHelp(selective, field, data)}
    </div>`
  }

  postRender(containerEl) {
    const actions = this.getConfig().get('pellActions', [
      'bold', 'italic', 'heading1', 'heading2', 'olist', 'ulist', 'link'])
    const fieldInstances = containerEl.querySelectorAll('.selective__field__markdown')
    for (const fieldInstance of fieldInstances) {
      if (!fieldInstance.pellEditor) {
        const pellEl = fieldInstance.querySelector('.pell')

        fieldInstance.pellEditor = pell.init({
          element: pellEl,
          actions: actions,
          onChange: (html) => {
            this.value = this.showdown.makeMarkdown(html)
            document.dispatchEvent(new CustomEvent('selective.render'))
          }
        })
      }

      if (this.isClean) {
        fieldInstance.pellEditor.content.innerHTML = this.showdown.makeHtml(this.value || '')
      }
    }
  }
}

export class SelectField extends Field {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this.fieldType = 'select'
    this.threshold = 12

    // Determine which icons to use
    this.useMulti = this.getConfig().get('multi', false)
    this.icons = (this.useMulti
      ? ['check_box_outline_blank', 'check_box']
      : ['radio_button_unchecked', 'radio_button_checked'])

    this.template = (selective, field, data) => html`<div
        class="selective__field selective__field__${field.fieldType} ${field.options.length > field.threshold ? `selective__field__${field.fieldType}--list` : ''}"
        data-field-type="${field.fieldType}" >
      <div class="selective__field__select__label">${field.label}</div>
      <div class="selective__field__select__options">
        ${repeat(field.options, (option) => option.value, (option, index) => html`
          <div class="selective__field__select__value" data-value="${option.value}" @click=${field.handleInput.bind(field)}>
            <div class="selective__field__select__option ${field._isSelected(option.value) ? 'selective__field__select__option--checked' : ''}">
              <i class="material-icons">${field._isSelected(option.value) ? field.icons[1] : field.icons[0] }</i>
              ${option.label || '(None)'}
            </div>
          </div>
        `)}
      </div>
      ${field.renderHelp(selective, field, data)}
    </div>`
  }

  _isSelected(optionValue) {
    let value = this.value

    if (!this.useMulti) {
      return value == '' ? optionValue == null : optionValue == value
    }

    // Reset when converting between non-array values.
    if (!Array.isArray(value)) {
      value = []
    }

    return (value || []).includes(optionValue)
  }

  handleInput(evt) {
    const target = findParentByClassname(evt.target, 'selective__field__select__value')
    const value = target.dataset.value == 'null' ? null : target.dataset.value

    if (!this.useMulti) {
      this.value = value
      document.dispatchEvent(new CustomEvent('selective.render'))
      return
    }

    if (!value) {
      return
    }

    // Adjust the list if using multi value
    let newValue = this.value || []

    // Reset when converting between non-array values.
    if (!Array.isArray(newValue)) {
      newValue = []
    }

    if (newValue.includes(value)) {
      newValue = newValue.filter(item => item !== value)
    } else {
      newValue.push(value)
    }
    this.value = newValue
    document.dispatchEvent(new CustomEvent('selective.render'))
  }
}

export class TextField extends Field {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this.fieldType = 'text'
    this.threshold = this.getConfig().threshold || 75
    this._isSwitching = false

    this.template = (selective, field, data) => html`<div class="selective__field selective__field__${field.fieldType}" data-field-type="${field.fieldType}">
      <label for="${field.getUid()}">${field.label}</label>
      ${field.updateFromData(data)}
      ${field.renderInput(selective, field, data)}
      ${field.renderHelp(selective, field, data)}
    </div>`
  }

  handleInput(evt) {
    super.handleInput(evt)

    // Check if the threshold has been reached.
    const isInput = evt.target.tagName.toLowerCase() == 'input'
    if (isInput && this.value.length > this.threshold && !this._isSwitching) {
      // Only trigger switch once.
      this._isSwitching = true

      const id = evt.target.id
      document.dispatchEvent(new CustomEvent('selective.render'))

      // Trigger auto focus after a delay for rendering.
      window.setTimeout(
        () => { inputFocusAtEnd(id) },
        25)
    }
  }

  renderInput(selective, field, data) {
    // Switch to textarea if the length is long.
    if ((this.value || '').length > this.threshold) {
      return html`
        <textarea
            id="${field.getUid()}"
            rows="${field.getConfig().rows || 6}"
            placeholder="${field.placeholder}"
            @input=${field.handleInput.bind(field)}>${this.value || ' '}</textarea>`
    }

    return html`
      <input
        type="text"
        id="${field.getUid()}"
        value="${this.value || ''}"
        placeholder="${field.placeholder}"
        @input=${field.handleInput.bind(field)}>`
  }
}

export class TextareaField extends Field {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this.fieldType = 'textarea'

    this.template = (selective, field, data) => html`<div class="selective__field selective__field__${field.fieldType}" data-field-type="${field.fieldType}">
      <label for="${field.getUid()}">${field.label}</label>
      <textarea
          id="${field.getUid()}"
          rows="${field.getConfig().rows || 6}"
          placeholder="${field.placeholder}"
          @input=${field.handleInput.bind(field)}>${field.valueFromData(data) || ' '}</textarea>
      ${field.renderHelp(selective, field, data)}
    </div>`
  }
}
