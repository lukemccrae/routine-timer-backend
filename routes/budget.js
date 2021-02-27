var router = require('express').Router()
const fs = require('fs')



router.get('/take', (req, res, next) => {

    fs.readFile('./private/budgetAvg', (err, jsonString) => {
        if (err) {
            throw err;
        } else {
            try {
                res.send({
                    success: true,
                    message: 'Heres your budget data',
                    budget: JSON.parse(jsonString)
                  })
            } catch(erro) {
                res.send({
                    success: false,
                    message: 'something went wrong'
                  })
                console.log('error parsing json:', err)
            }
        }
    });
    
  })

  router.post('/give', (req, res, next) => {
      try {
        fs.writeFileSync('./private/budgetAvg', JSON.stringify(req.body))
      } catch (err) {
        console.error(err)
        res.send({
            success: false,
            message: 'Error occured'
          })
      }
      res.send({
        success: true,
        message: 'budget data stored'
      })
  })

module.exports = router;