var seriesData = require('./series-data.json');
var fs = require('fs');

var destPath = __dirname + '/mood-data.json'

var moodData = {
    data: {
        rootNode: {
            key: seriesData.name + '-key',
            name: seriesData.name
        },
        level1Relationship: [],
        level2Relationship: [],
        level3Relationship: [],
        level4Relationship: []
    }
}

function traverseChildren(level, parent, children, moodData, path) {
    const levelProperty = 'level' + level + 'Relationship'
    // console.log(levelProperty)
    // if (level === 4) {
    //     console.log(JSON.stringify(moodData))
    // }


    children.forEach(function(child) {
        const grandChildren = child.children
        const key = path + '.' + child.name
        const node = {
            key: key,
            name: child.name,
            value: child.value ? child.value : null
        }
        const link = {
            source: parent,
            target: node
        }
        moodData[levelProperty].push(link)
        if (grandChildren && grandChildren.length > 0) {
            traverseChildren(level + 1, node, grandChildren, moodData, key)
        }
    })
}

traverseChildren(1, moodData.data.rootNode, seriesData.children, moodData.data, seriesData.name)
//console.log(JSON.stringify(moodData, null, 2))
    
fs.writeFile(destPath, JSON.stringify(moodData, null, 2), function(err) {
    if (err) {
        return console.error(err);
    }
    console.log('Write ' + destPath)
});
