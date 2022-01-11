const fs = require('fs');
const crypto = require('crypto');

class DataRelRepository {
    constructor(filename) {
        if (!filename) {
            throw new Error('Creating a repository requires a filename');
        }

        this.filename = filename;
        try {
            fs.accessSync(this.filename);
        } catch (err) {
            fs.writeFileSync(this.filename, '[]');
        }
    }
}

module.exports = new DataRelRepository('dataRel.json');