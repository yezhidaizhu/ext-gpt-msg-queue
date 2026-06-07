export const DeepseekConfig = {
  textaraSelector: `.ds-virtual-list div:not(.ds-virtual-list-items) textarea`,
  btnStatusSelectors: {
    ready: `.ds-virtual-list div:not(.ds-virtual-list-items) .ds-button:has(path[d^="M8.3125 0.981587"])`,
    generating: `.ds-virtual-list div:not(.ds-virtual-list-items) .ds-button:has(path[d^="M2 4.88C2 3.68009"])`,
  },
};


