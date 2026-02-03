import { ScrollAreaNativeVertical } from '@/shared/ui-kit/ui/scroll-area-native-vertical';
import { isEmpty } from 'lodash-es';
import { useComponentTriggerMatch } from './helpers';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import type { LexicalEditor, TextNode } from 'lexical';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getBaseOptions } from './config';
import type { ComponentPickerOption } from './option-model';
import { ComponentsDropdownItem } from './ui/components-dropdown';

function ComponentPickerPlugin() {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor);

    if (!queryString || isEmpty(queryString)) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, 'i');

    return [
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) || option.keywords.some((keyword) => regex.test(keyword)),
      ),
    ];
  }, [editor, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor],
  );

  const { matchSlash, matchDot } = useComponentTriggerMatch();

  return (
    <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
      anchorClassName="z-50 relative"
      options={options}
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={(text: string, editor: LexicalEditor) =>
        matchSlash(text, editor) ?? matchDot(text, editor)
      }
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex, options },
      ) => {
        return anchorElementRef.current && options.length
          ? createPortal(
              <ScrollAreaNativeVertical className="w-50 max-h-40 grow shadow-2xl bg-background rounded-md border relative">
                <ul className="grow min-w-0">
                  {options.map((option, i) => (
                    <ComponentsDropdownItem
                      index={i}
                      key={option.key}
                      option={option}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i);
                      }}
                    />
                  ))}
                </ul>
              </ScrollAreaNativeVertical>,

              anchorElementRef.current,
              'component-picker-plugin',
            )
          : null;
      }}
    />
  );
}

export { ComponentPickerPlugin };
