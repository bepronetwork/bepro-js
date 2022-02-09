const parseComment = (comment = ``) => [`  /**`, `   * ${comment}`, `   */\n`].join(`\n`)

module.exports = parseComment;
