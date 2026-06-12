'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { DismissableLayerBranch } from '@radix-ui/react-dismissable-layer';
import type { LexicalEditor, TextNode } from 'lexical';
import { isEmpty } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ScrollAreaNativeVertical } from '@/shared/ui-kit';
import { getBaseOptions } from './config';
import { useComponentTriggerMatch } from './helpers';
import type { ComponentPickerOption } from './option-model';
import { ComponentsDropdownItem } from './ui/components-dropdown';

function ComponentPickerPlugin({ disabled }: { disabled: boolean }) {
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
        (option) => regex.test(option.title) || option.keywords.some((keyword) => regex.test(keyword)),
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

  if (disabled) return null;
  return (
    <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
      anchorClassName="z-100 absolute"
      options={options}
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={(text: string, editor: LexicalEditor) => matchSlash(text, editor) ?? matchDot(text, editor)}
      menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex, options }) => {
        return anchorElementRef.current && options.length
          ? createPortal(
              <DismissableLayerBranch>
                <ScrollAreaNativeVertical className="w-50 h-full max-h-40 grow shadow-2xl bg-background rounded-md border relative lexical-typehead-menu">
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
                </ScrollAreaNativeVertical>
              </DismissableLayerBranch>,

              anchorElementRef.current,
              'component-picker-plugin',
            )
          : null;
      }}
    />
  );
}

export { ComponentPickerPlugin };
