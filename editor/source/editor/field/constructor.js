/**
 * Constructor field types for the editor extension.
 */

import {
  html,
  repeat,
  Field,
  FieldRewrite,
} from 'selective-edit'
import {
  findParentByClassname,
  inputFocusAtEnd,
} from '../../utility/dom'
import {
  createWhiteBlackFilter,
  createValueFilter,
} from '../../utility/filter'
import {
  FileListUI,
} from '../ui/file'

export class ConstructorField extends FieldRewrite {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this.fieldType = 'constructor'
    this.tag = '!g.*'
  }

  handleInput(evt) {
    const locale = evt.target.dataset.locale

    // Constructors are represented as objects in json.
    const value = {
      'value': evt.target.value,
      'tag': this.tag,
    }
    this.setValueForLocale(locale, value)
  }

  renderInput(selective, data, locale) {
    const value = this.getValueForLocale(locale) || {}

    return html`
      <input
        id="${this.uid}${locale}"
        placeholder=${this.config.placeholder || ''}
        data-locale=${locale || ''}
        @input=${this.handleInput.bind(this)}
        value=${value.value || ''} />`
  }
}

export class ConstructorFileField extends ConstructorField {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this._fileListUi = {}
    this._showFileList = {}
    this.filterFunc = createWhiteBlackFilter(
      // Whitelist.
      this.configRegExpList('whitelist'),
      // Blacklist.
      this.configRegExpList('blacklist'),
    )
  }

  configRegExpList(configKey, defaults) {
    const list = []
    const rawList = this.getConfig().get(configKey, [])
    for (const value of rawList) {
      list.push(new RegExp(value, 'gi'))
    }

    if (!list.length) {
      return defaults || []
    }

    return list
  }

  fileListUiForLocale(locale) {
    const localeKey = this.keyForLocale(locale)
    if (!this._fileListUi[localeKey]) {
      this._fileListUi[localeKey] = new FileListUI({
        'filterFunc': this.filterFunc,
      })

      // Bind the pod path listener event for the UI.
      this._fileListUi[localeKey].listeners.add('podPath', this.handlePodPath.bind(this))
    }
    return this._fileListUi[localeKey]
  }

  handleFilesToggleClick(evt) {
    const locale = evt.target.dataset.locale
    this.fileListUiForLocale(locale).toggle()
  }

  handlePodPath(podPath, locale) {
    const localeKey = this.keyForLocale(locale)
    const value = {
      tag: this.tag,
      value: podPath,
    }
    this.setValueForLocale(locale, value)
  }

  renderInput(selective, data, locale) {
    const value = this.getValueForLocale(locale) || {}
    const fileListUi = this.fileListUiForLocale(locale)

    return html`
      <div class="selective__field__constructor__input">
        <input
          id="${this.uid}${locale}"
          placeholder=${this.config.placeholder || ''}
          data-locale=${locale || ''}
          @input=${this.handleInput.bind(this)}
          value=${value.value || ''} />
        <i
            class="material-icons selective__field__constructor__file_icon"
            title="Select pod path"
            data-locale=${locale || ''}
            @click=${this.handleFilesToggleClick.bind(this)}>
          list_alt
        </i>
      </div>
      ${fileListUi.renderFileList(selective, data, locale)}`
  }
}

export class DocumentField extends ConstructorFileField {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this.fieldType = 'document'
    this.tag = '!g.doc'
    this.filterFunc = createWhiteBlackFilter(
      // Whitelist.
      this.configRegExpList('whitelist', [/^\/content\//]),
      // Blacklist.
      this.configRegExpList('blacklist'),
    )
  }
}

export class YamlField extends ConstructorFileField {
  constructor(config, extendedConfig) {
    super(config, extendedConfig)
    this.fieldType = 'yaml'
    this.tag = '!g.yaml'
    this.filterFunc = createWhiteBlackFilter(
      // Whitelist.
      this.configRegExpList('whitelist', [/^\/content\/.*\.yaml$/, /^\/data\/.*\.yaml$/]),
      // Blacklist.
      this.configRegExpList('blacklist'),
    )
  }
}
