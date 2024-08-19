const inputUrl = document.getElementById('url-input') as HTMLTextAreaElement;
const outputError = document.getElementById('error') as HTMLDivElement;
const resultContainer = document.getElementById('result') as HTMLDivElement;
const outputContainer = document.getElementById('output') as HTMLDivElement;
const outputTabs = document.querySelectorAll('.output-tab') as NodeListOf<HTMLDivElement>;
const outputUrl = document.getElementById('formatted-url') as HTMLPreElement;
const outputJson = document.getElementById('formatted-json') as HTMLPreElement;

const buttonFormat = document.getElementById('format-button') as HTMLButtonElement;
const buttonCopy = document.querySelectorAll('.copy-button') as NodeListOf<HTMLDivElement>;
const buttonCopyUrl = document.getElementById('copy-url') as HTMLButtonElement;
const buttonCopyJson = document.getElementById('copy-json') as HTMLButtonElement;

const formatURL = () => {
    resultContainer.classList.remove('hidden');
    resultContainer.classList.add('flex');

    try {
        const urlValue = inputUrl.value.trim();

        if (!urlValue.length) {
            throw new Error('Please enter a URL.');
        }

        const parsedUrl = new URL(urlValue);

        if (
            !['http:', 'https:'].includes(parsedUrl.protocol) ||
            !parsedUrl.hostname ||
            parsedUrl.pathname.includes(' ') ||
            (parsedUrl.port && (+parsedUrl.port <= 0 || +parsedUrl.port > 65535)) ||
            (parsedUrl.search && parsedUrl.search.includes(' '))
        ) {
            throw new Error('Given URL is not valid.');
        }

        if (!parsedUrl.search.length) {
            throw new Error('Given URL has no parameters.');
        }

        inputUrl.classList.remove('border-red-500', 'focus:border-red-500');
        inputUrl.classList.add('border-stone-500', 'focus:border-blue-500');

        const params = new URLSearchParams(parsedUrl.search);

        let formattedUrl = `${parsedUrl.origin}${parsedUrl.pathname}\n\n`;
        const queryObj = {} as { [key: string]: string };

        const maxKeyLength = Math.max(...[...params.keys()].map((key) => key.length), 0);

        for (const [key, value] of params.entries()) {
            const paddedKey = key.padEnd(maxKeyLength, ' ');
            formattedUrl += `${paddedKey} = ${value}\n`;

            try {
                queryObj[key] = JSON.parse(decodeURIComponent(value));
            } catch {
                queryObj[key] = value;
            }
        }

        outputUrl.textContent = formattedUrl;
        outputJson.textContent = JSON.stringify(
            {
                url: urlValue,
                scheme: parsedUrl.protocol.replace(':', ''),
                authority: parsedUrl.hostname,
                fragment: parsedUrl.hash.replace('#', ''),
                query: parsedUrl.search.replace('?', ''),
                host: parsedUrl.host,
                path: parsedUrl.pathname,
                queryParameters: queryObj
            },
            null,
            4
        );

        Prism.highlightElement(outputJson as HTMLElement);

        outputContainer.classList.remove('hidden');
        outputContainer.classList.add('flex');
        outputError.classList.add('hidden');
    } catch (error) {
        inputUrl.classList.remove('border-stone-500', 'focus:border-blue-500');
        inputUrl.classList.add('border-red-500', 'focus:border-red-500');

        outputContainer.classList.remove('flex');
        outputContainer.classList.add('hidden');
        outputError.classList.remove('hidden');

        outputError.textContent = (<{ message: string }>error).message;
    }
};

inputUrl.addEventListener('paste', () => setTimeout(formatURL, 0));
buttonFormat.addEventListener('click', formatURL);

buttonCopy.forEach((button) =>
    button.addEventListener('click', async (e) => {
        const buttonElement = e.currentTarget as HTMLButtonElement;
        const buttonType = buttonElement.dataset.type;

        const copyIcon = buttonElement.querySelector('.copy-icon') as HTMLDivElement;
        const copyFinish = buttonElement.querySelector('.copy-finish') as HTMLDivElement;

        copyIcon.classList.add('hidden');

        const formattedSelector = `formatted-${buttonType}`;
        const formattedText = document.getElementById(formattedSelector)?.textContent;
        await navigator.clipboard.writeText(formattedText || '');

        copyFinish.classList.remove('hidden');

        setTimeout(() => {
            copyIcon.classList.remove('hidden');
            copyFinish.classList.add('hidden');
        }, 600);
    })
);

outputTabs.forEach((button) =>
    button.addEventListener('click', (e) => {
        const buttonElement = e.currentTarget as HTMLButtonElement;
        const buttonType = buttonElement.dataset.type;

        outputTabs.forEach((tab) => {
            const tabType = tab.dataset.type;

            if (tab.dataset.type === buttonType) {
                (<HTMLDivElement>document.getElementById(`output-${buttonType}`)).classList.remove('hidden');

                buttonElement.classList.remove('bg-stone-800', 'hover:bg-stone-700');
                buttonElement.classList.add('bg-stone-600', 'hover:bg-stone-600');
            } else {
                (<HTMLDivElement>document.getElementById(`output-${tabType}`)).classList.add('hidden');

                tab.classList.remove('bg-stone-600', 'hover:bg-stone-600');
                tab.classList.add('bg-stone-800', 'hover:bg-stone-700');
            }
        });
    })
);
