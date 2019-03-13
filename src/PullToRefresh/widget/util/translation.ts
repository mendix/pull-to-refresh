export const mxTranslation = (namespace: string, key: string, replacements: any[]) => {
    const templateString = mx.session.getConfig(`uiconfig.translations.${namespace}.${key}`)
        || (window.mx.session.getConfig("uiconfig.translations") as any)[`${namespace}.${key}`] as string
        || "[No translation]";

    return replacements.reduce<string>(
        (substituteMessage, value, index) => substituteMessage.split("{" + (index + 1) + "}").join(value),
        templateString
    );
};
