// Copyright ©2020 MarkLogic Corporation.
import { saveAs } from 'file-saver'

const Downloader = {
  data () {},
  methods: {

    // Parse out DHF and MarkLogic reserved collections, plus Pipes data collections
    downloadJson: function (json, filename) {
      console.log(json)
      var blob = new Blob([JSON.stringify(json)], {
        type: 'text/json;charset=utf-8',
        endings: 'transparent'
      })

      saveAs(blob, filename + '.json')
    }
  }

}
export default Downloader
