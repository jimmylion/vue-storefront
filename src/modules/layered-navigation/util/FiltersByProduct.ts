const keysToCheck = [
  'color_group',
  'print',
  'featured',
  'style',
  'length',
  'talla_options',
]

export default function (omit = []) { return (total, curr) => {

  for (let key of keysToCheck) {
    if (omit.includes(key)) {
      total[key] = this.attributesFromProducts[key]
      continue;
    } else {

    if (curr.hasOwnProperty(key)) {
      if(!total.hasOwnProperty(key)) {
            if (Array.isArray(curr[key])) {
              total[key] = [...curr[key].filter(v => !!v).map(v => v+'')]
            } else {
              total[key] = [curr[key]+'']
            }
          } else {
            if (Array.isArray(curr[key])) {
              for (let value of curr[key]) {
                if(!total[key].includes(value+'') && value) {
                  // It has not existed in array yet
                  total[key].push(value+'')
                }
              }
            } else {
              if(!total[key].includes(curr[key]+'') && curr[key]) {
                // It has not existed in array yet
                total[key].push(curr[key]+'')
              }
            }
          }
        } 
        // else if (key === 'featured') {
          if (curr.configurable_children) {
            for (let child of curr.configurable_children) {

              if (!child[key]) {
                continue;
              }
  
              if(!total.hasOwnProperty(key)) {
                if (Array.isArray(child[key])) {
                  total[key] = [...child[key].filter(v => !!v).map(v => v+'')]
                } else {
                  total[key] = [child[key]+'']
                }
              } else {
                if (Array.isArray(child[key])) {
                  for (let value of child[key]) {
                    if(!total[key].includes(value+'') && value) {
                      // It has not existed in array yet
                      total[key].push(value+'')
                    }
                  }
                } else {
                  if(!total[key].includes(child[key]+'') && child[key]) {
                    // It has not existed in array yet
                    total[key].push(child[key]+'')
                  }
                }
              }
  
            }
          }

        // }
    }


  }

  return total

}
}