import ReactDOM from 'react-dom/client';

type Blocks = { [name: string]: React.LazyExoticComponent<any> };

const renderComponent = (blocks: Blocks, scriptSection: HTMLScriptElement) => {
  const blockType = scriptSection.getAttribute('data-rct');
  const data = scriptSection.textContent ? scriptSection.textContent : '{}';

  if (!blockType || !data) {
    return;
  }

  const Component = blocks[blockType];

  if (Component) {
    scriptSection.textContent = null;
    const section = document.createElement(scriptSection.getAttribute('data-tag') ?? 'section');

    section.className = scriptSection.getAttribute('data-class') ?? '';
    scriptSection.replaceWith(section);

    const props = JSON.parse(data);

    ReactDOM.createRoot(section).render(<Component {...props} />);
  } else {
    return <></>;
  }
};

export const initReactLoader = (blocks: Blocks) => {
  const renderComponents = () => {
    // rct stands for 'react component type'
    const scriptSections = document.querySelectorAll('script[data-rct]');

    [].forEach.call(scriptSections, (s: HTMLScriptElement) => renderComponent(blocks, s));
  };

  window.renderComponents = renderComponents;
  renderComponents();
  window.addEventListener('load', () => renderComponents());

  // Post a custom event to notify that the renderComponents function is ready to be used
  // Usage:
  // if (window.renderComponents) {
  //   window.renderComponents();
  // } else {
  //   window.addEventListener('react-loaded', () => {
  //     window.renderComponents();
  //   });
  // }
  const event = new CustomEvent('react-loaded');

  window.dispatchEvent(event);
};
