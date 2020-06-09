import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';
import { getSelectedDropdownViewWidget } from './utils';

export default class DropdownSelectToolbar extends Plugin {
  static get requires() {
    return [WidgetToolbarRepository];
  }

  afterInit() {
    const editor = this.editor;
    const widgetToolbarRepository = editor.plugins.get('WidgetToolbarRepository');

    widgetToolbarRepository.register('dropdownSelect', {
      items: editor.config.get('dropdownSelect.toolbar') || [],
      getRelatedElement: getSelectedDropdownViewWidget
    });
  }
}
