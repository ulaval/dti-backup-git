const simpleGit = require('simple-git/promise');
const logger = require('./logger');

// See https://github.com/steveukx/git-js

async function cloneMirror(cloneUrl, dir, user, pwd) {
    const remoteUrl = insertCredentialsInCloneUrl(cloneUrl, user, pwd);
    const fakeRemote = insertCredentialsInCloneUrl(cloneUrl, user, 'xxx');

    const state = logger.cmdStart(`git clone --mirror ${fakeRemote} ${dir}`);

    await simpleGit()
        .silent(true)
        .raw([
            'clone',
            '--mirror',
            remoteUrl,
            dir
        ]);

    await setRemoteUrl(dir, 'origin', cloneUrl);

    logger.cmdSuccess(state);
}

async function remoteUpdate(cloneUrl, dir, user, pwd) {
    const state = logger.cmdStart(`git remote update in ${dir} with ${cloneUrl}`);

    const remoteUrl = insertCredentialsInCloneUrl(cloneUrl, user, pwd);

    await setRemoteUrl(dir, 'origin', remoteUrl);

    await simpleGit(dir)
        .raw([
            'remote',
            'update'
        ])

    await setRemoteUrl(dir, 'origin', cloneUrl);

    logger.cmdSuccess(state);
}

async function setRemoteUrl(dir, remoteName, remoteUrl) {
    await simpleGit(dir)
        .raw([
            'remote',
            'set-url',
            remoteName,
            remoteUrl
        ]);
}

function insertCredentialsInCloneUrl(originalCloneUrl, user, pwd) {
    if (!user) {
        return originalCloneUrl;
    }

    const regex = /(\w+:\/\/)(?:[\w:]+@)?(.*)/g;

    const matches = regex.exec(originalCloneUrl);

    if (!matches) {
        throw new Error(`The clone url ${originalCloneUrl} is not recognized`);
    }

    return matches[1] + user + ':' + pwd + '@' + matches[2];
}

module.exports = {
    cloneMirror,
    remoteUpdate,
    insertCredentialsInCloneUrl
}
