Vue.use(Vuex);

const TYPE_IMAGE = 'img';
const TYPE_AV = 'av';
const TYPE_DOC = 'doc';
const TYPE_OTHER = 'other';

const DOCUMENT_TYPES = [
  'text/rtf',
  'text/richtext',
  'application/rtf',
  'application/x-rtf',
  'application/msword',
  'application/vnd.ms-word.document.macroenabled.12',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.ms-excel.sheet.macroenabled.12',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-powerpoint.presentation.macroenabled.12',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/x-iwork-pages-sffpages',
  'application/x-iwork-keynote-sffkey',
  'application/x-iwork-numbers-sffnumbers',
  'text/html',
  'text/plain'
];

let pickerCounter = 0;

const IMAGE_TYPES = ['application/illustrator', 'application/postscript', 'application/photoshop', 'application/psd', 'application/x-photoshop'];

const detectType = mime => {
  if (mime.indexOf('image/') > -1 || IMAGE_TYPES.indexOf(mime) > -1) {
    return TYPE_IMAGE;
  }

  if (mime.indexOf('audio/') > -1 || mime.indexOf('video/') > -1) {
    return TYPE_AV;
  }

  if (DOCUMENT_TYPES.indexOf(mime) > -1) {
    return TYPE_DOC;
  }

  return TYPE_OTHER;
};

const store = new Vuex.Store({
  state: {
    imageFile: '7VJwZLwtTZqZ8cs1StJV',
    imageTransformation: null,
    availableImageTransformations: [
      { name: 'Monochrome', task: 'monochrome' },
      { name: 'Sepia', task: 'sepia' },
      { name: 'Negative', task: 'negative' },
      { name: 'Blur', task: 'blur', params: { amount: 2 } }
    ],
    documentFile: 'Nk6PvZiRAeBfzVEjcakG',
    documentTransformation: null,
    availableDocumentTransformations: [
      { name: 'To PDF', task: 'output', params: { format: 'pdf' } },
      { name: 'Output Page 1', task: 'output', params: { page: 1 } },
      { name: 'Output Page Format A3', task: 'output', params: { pageformat: 'a3' } }
    ],
    avFile: 'I4NSQOzlRJWKRfXAT036',
    avTransformation: null,
    availableAvTransformations: [
      { name: 'To WEBM', task: 'video_convert', params: { preset: 'webm' } },
      { name: 'To MP3', task: 'video_convert', params: { preset: 'mp3' } },
      { name: 'Resize', task: 'video_convert', params: { width: 400, height: 400 } }
      // { name: 'Truncate', task: 'video_convert', params: {} }  ??
    ],
    pdfFile: 'NzzkH9MfSUagc2PySLL6',
    tagsFile: '7VJwZLwtTZqZ8cs1StJV'
  },
  getters: {
    imageFile: state => state.imageFile,
    imageTransformation: state => state.imageTransformation,
    availableImageTransformations: state => state.availableImageTransformations,
    documentFile: state => state.documentFile,
    documentTransformation: state => state.documentTransformation,
    availableDocumentTransformations: state => state.availableDocumentTransformations,
    // imageSrc: state => state.imageFile,
    avFile: state => state.avFile,
    avTransformation: state => state.avTransformation,
    availableAvTransformations: state => state.availableAvTransformations,
    pdfFile: state => state.pdfFile,
    tagsFile: state => state.tagsFile
  },
  mutations: {
    SET_MAIN_FILE: (state, file) => {
      const type = detectType(file.mimetype);
      switch (type) {
        case TYPE_IMAGE: //#endregion
          state.imageFile = file.handle;
          break;
        case TYPE_AV: //#endregion
          state.avFile = file.handle;
          break;

        case TYPE_DOC: //#endregion
          state.documentFile = file.handle;
          break;
      }

    },
    SET_IMAGE_FILE: (state, file) => {
      state.imageFile = file.handle;
    },
    SET_DOCUMENT_FILE: (state, file) => {
      state.documentFile = file.handle;
    },
    SET_AV_FILE: (state, file) => {
      state.avFile = file.handle;
    },
    SET_PDF_FILE: (state, file) => {
      state.pdfFile = file.handle;
    },
    SET_TAGS_FILE: (state, file) => {
      state.tagsFile = file.handle;
    },
    SET_IMAGE_TRANSFORM: (state, transform) => {
      state.imageTransformation = transform;
    },
    SET_DOCUMENT_TRANSFORM: (state, transform) => {
      state.documentTransformation = transform;
    },
    SET_AV_TRANSFORM: (state, transform) => {
      state.avTransformation = transform;
    }
  }
});

const Picker = {
  template: `<div>
    <div v-if="mode === 'overlay'">
      <button class="sc-btn sc-btn-lg" @click.prevent="open">Open Picker</button>
      <div :id="randId"></div>
    </div>
    <div v-if="mode !== 'overlay'" :id="randId"></div>
  </div>`,
  props: {
    mode: String,
    accept: Array,
    sources: Array
  },
  data: () => {
    return {
      randId: null
    };
  },
  computed: {},
  created() {
    this.randId = this.rand() + pickerCounter;
    pickerCounter++;

    let options = {
      container: this.randId,
      rootId: this.rand(),
      uploadInBackground: false,
      displayMode: this.mode || 'inline',
      maxFiles: 1,
      onFileUploadFinished: file => this.$emit('done', file),
      onFileUploadProgress: progress => this.$emit('progress', progress),
      onFileUploadFailed: file => this.$emit('error', file)
    };

    if (this.sources && this.sources.length) {
      options.fromSources = this.sources;
    }

    if (this.accept && this.accept.length) {
      options.accept = this.accept;
    }

    options.storeTo = {
      container: 'devportal-customers-assets',
      path: 'user-uploads/',
      region: 'us-east-1'
    }

    this.picker = this.$root.client.picker(options);
  },
  mounted() {
    if (this.mode !== 'overlay') {
      this.picker.open();
    }
  },
  methods: {
    open() {
      this.picker.open();
    },
    rand: () => {
      const min = 1;
      const max = 100;
      return `picker-${Math.round(Math.random() * (max - min) + min)}`;
    }
  }
};

const Preview = {
  template: `<div>
    <img :src="imgSrc" v-if="imgSrc"/>
    <ul>
      <li v-for="item in transforms">
        <a class="elementor-button-link elementor-button elementor-size-sm" href="#" @click.prevent="applyTransform(item)">{{item.name}}</a>
      </li>
    </ul>
  </div>`,
  props: ['handle', 'applied', 'transforms'],
  data: () => {
    return {
      imgSrc: null
    };
  },
  methods: {
    applyTransform(transform) {
      this.$store.commit('SET_IMAGE_TRANSFORM', transform);
    },
    combineFile() {
      if (!this.handle) {
        return;
      }

      var fl = new filestack.Filelink(this.handle, this.$root.apikey);

      if (this.$root.security) {
        fl.security(this.$root.security);
      }

      if (this.applied) {
        fl.addTask(this.applied.task, this.applied.params);
      }

      this.imgSrc = fl.toString();
    }
  },
  watch: {
    handle() {
      this.combineFile();
    },
    applied() {
      this.combineFile();
    }
  }
};

const MainPicker = {
  components: { Picker },
  data() {
    return {
      result: null,
    };
  },
  template: `<div><div style="min-height:400px; position:relative;"><picker @done="onFileUploaded" @error="onFileError"></picker>
  </div><div v-if="result"><h5>Response:</h5><pre class="sc-pre">{{JSON.stringify(result, null, 2)}}</pre></div></div>`,
  computed: {},
  methods: {
    onFileUploaded(file) {
      this.$store.commit('SET_MAIN_FILE', file);
      this.result = file;
      console.log('File Uploaded', file);
    },
    onFileError(file) {
      console.log('File error', file);
    }
  }
};

const ImagePicker = {
  components: { Picker },
  template: `<div style="height:100%;"><picker @done="onFileUploaded" :accept="['image/*']" @error="onFileError" mode="overlay"></picker></div>`,
  methods: {
    onFileUploaded(file) {
      this.$store.commit('SET_IMAGE_FILE', file);
      console.log('File Uploaded', file);
    },
    onFileError(file) {
      console.log('File error', file);
    }
  }
};

const ImagePreview = {
  template: `<div>
    <div class="sc-url-box">
      <span>https://cdn.filestackcontent.com / YOUR_API_KEY /</span>
      <span class="sc-url-box-transform">{{ appliedTransform }}</span>
      <span>/ file-id-here {{ urlHandle }}</span>
    </div>
    <p class="text-center">
      <img :src="imgSrc" v-if="imgSrc"/>
    </p>
    <div class="m-btnGroup m-btnGroup--homepageShowcase">
      <a v-for="item in transforms" class="a-btn -primary" href="#" 
      :class="{'-active': isActive(item)}"
      @click.prevent="applyTransform(item)">{{item.name}}</a>
      <a class="a-btn -ghost" href="https://www.filestack.com/docs/api/processing/#overview" title="Visit Documentation Page">Even more</a>
    </div>
  </div>`,
  data: () => {
    return {
      imgSrc: null,
      appliedTransform: 'transformation',
      urlHandle: this.handle,
    };
  },
  computed: {
    applied() {
      return this.$store.getters.imageTransformation;
    },
    transforms() {
      return this.$store.getters.availableImageTransformations;
    },
    handle() {
      return this.$store.getters.imageFile;
    }
  },
  mounted() {
    if (this.handle) {
      const fl = new filestack.Filelink(this.handle, this.$root.apikey);
      if (this.$root.security) {
        fl.security(this.$root.security);
      }

      this.imgSrc = fl;
    }
  },
  methods: {
    isActive(item) {
      if (this.applied && item.task === this.applied.task) {
        return true;
      }

      return false;
    },
    applyTransform(transform) {
      this.$store.commit('SET_IMAGE_TRANSFORM', transform);
      this.appliedTransform = transform.task;

    },
    generate() {
      if (!this.handle) {
        return;
      }

      var fl = new filestack.Filelink(this.handle, this.$root.apikey);

      if (this.$root.security) {
        fl.security(this.$root.security);
      }

      if (this.applied) {
        fl.addTask(this.applied.task, this.applied.params);
      }

      this.imgSrc = fl.toString();
    }
  },
  watch: {
    handle() {
      this.generate();
    },
    applied() {
      this.generate();
    }
  }
};

const DocumentPicker = {
  components: { Picker },
  template: `<div><picker @done="onFileUploaded" @error="onFileError" mode="overlay"></picker></div>`,
  computed: {},
  methods: {
    onFileUploaded(file) {
      this.$store.commit('SET_DOCUMENT_FILE', file);
      console.log('File Uploaded', file);
    },
    onFileError(file) {
      console.log('File error', file);
    }
  }
};

const DocumentPreview = {
  template: `<div>
    <div class="sc-url-box">
      <span>https://cdn.filestackcontent.com / YOUR_API_KEY /</span>
      <span class="sc-url-box-transform">{{ appliedTransform }}</span>
      <span>/ file-id-here /</span>
    </div>
    <div id="docPreview" class="sc-preview-wrapper"></div>
    <div class="sc-d-flex sc-justify-content-space-evenly">
      <div v-for="item in transforms">
        <a class="sc-btn" href="#"
        :class="{'is-active': isActive(item)}" @click.prevent="applyTransform(item)">{{item.name}}</a>
      </div>
      <div>
        <a class="sc-btn btn-secondary" href="https://www.filestack.com/docs/api/processing/#file-conversions" title="Visit Documentation Page">Even more</a>
      </div>
    </div>
  </div>`,
  data: () => {
    return {
      appliedTransform: 'transformation'
    };
  },
  computed: {
    handle() {
      return this.$store.getters.documentFile;
    },
    applied() {
      return this.$store.getters.documentTransformation;
    },
    transforms() {
      return this.$store.getters.availableDocumentTransformations;
    },
  },
  mounted() {
    this.generate();
  },
  methods: {
    isActive(item) {
      if (this.applied 
        && item.task === this.applied.task
        && item.params === this.applied.params) {
        return true;
      }

      return false;
    },
    applyTransform(transform) {
      this.$store.commit('SET_DOCUMENT_TRANSFORM', transform);
      this.appliedTransform = `${transform.task}=${Object.keys(transform.params)[0]}:${Object.values(transform.params)[0]}`;
    },
    generate() {
      if (!this.handle) {
        return;
      }

      document.getElementById('docPreview').innerHTML = '';

      var fl = new filestack.Filelink(this.handle, this.$root.apikey);
      if (this.$root.security) {
        fl.security(this.$root.security);
      }

      if (this.applied) {
        fl.addTask(this.applied.task, this.applied.params);
        this.processTransformation(fl)
      } else {
        this.$root.client.preview(this.handle, { id: 'docPreview' });
      }
    },
    processTransformation(fl) {
      fl.store();
      console.log(fl.toString());
      axios.get(fl)
        .then(res => {
          document.getElementById('docPreview').innerHTML = '';
          this.$root.client.preview(res.data.handle, { id: 'docPreview' });
        });
    }
  },
  watch: {
    handle() {
      this.generate();
    },
    applied() {
      this.generate();
    }
  }
};

const AvPicker = {
  components: { Picker },
  template: `<div><picker @done="onFileUploaded" @error="onFileError" mode="overlay" :accept="['video/*']"></picker></div>`, // :sources="['local_file_system']" 
  methods: {
    onFileUploaded(file) {
      this.$store.commit('SET_AV_FILE', file);
      console.log('File Uploaded', file);
    },
    onFileError(file) {
      console.log('File error', file);
    }
  }
};

const AvPreview = {
  template: `<div :class="{'isLoading': isLoading}">
    <div class="sc-url-box">
      <span>https://cdn.filestackcontent.com / YOUR_API_KEY /</span>
      <span class="sc-url-box-transform">{{ appliedTransform }}</span>
      <span>/ file-id-here /</span>
    </div>
    <video v-if="videoSrc" width="320" height="240" controls>
      <source :src="videoSrc">
      Your browser does not support the video tag.
    </video> 
    <ul class="sc-d-flex sc-justify-content-space-evenly sc-no-bullets">
      <li v-for="item in transforms">
        <a class="sc-btn" href="#" 
        :class="{'is-active': isActive(item)}"@click.prevent="applyTransform(item)">{{item.name}}</a>
      </li>
      <li>
        <a class="sc-btn btn-secondary" href="https://www.filestack.com/docs/api/processing/#audio-and-video" title="Visit Documentation Page">Even more</a>
      </li>
    </ul>
  </div>`,
  data: () => {
    return {
      pendingTimeout: false,
      videoSrc: null,
      isLoading: false,
      appliedTransform: 'transformation'
    };
  },
  computed: {
    applied() {
      return this.$store.getters.avTransformation;
    },
    transforms() {
      return this.$store.getters.availableAvTransformations;
    },
    handle() {
      return this.$store.getters.avFile;
    }
  },
  mounted() {
    if (this.handle) {
      const fl = new filestack.Filelink(this.handle, this.$root.apikey);
      if (this.$root.security) {
        fl.security(this.$root.security);
      }

      this.videoSrc = fl;
    }
  },
  methods: {
    isActive(item) {
      if (this.applied && item.task === this.applied.task && item.params === this.applied.params) {
        return true;
      }

      return false;
    },
    applyTransform(transform) {
      this.$store.commit('SET_AV_TRANSFORM', transform);
      this.appliedTransform = `${transform.task}=${Object.keys(transform.params)[0]}:${Object.values(transform.params)[0]}`;
    },
    combineFile() {
      if (!this.handle) {
        return;
      }

      var fl = new filestack.Filelink(this.handle, this.$root.apikey);
      if (this.$root.security) {
        fl.security(this.$root.security);
      }

      if (this.applied) {
        fl.addTask(this.applied.task, this.applied.params);
      } else {
        this.videoSrc = null;

        this.$nextTick(() => {
          this.videoSrc = fl;
        });
        return;
      }

      if (this.pendingTimeout) {
        clearTimeout(this.pendingTimeout);
      }

      this.checkStatus(fl);
    },
    checkStatus(url) {
      this.isLoading = true;
      this.videoSrc = null;

      axios
        .get(url)
        .then(res => {
          const responseBody = res.data;

          if (responseBody.status === 'completed') {
            this.$nextTick(() => {
              this.videoSrc = responseBody.data.url + '?policy=' + this.$root.security.policy + '&signature=' + this.$root.security.signature;
            });
          } else if (responseBody.status === 'pending' || responseBody.status === 'started') {
            this.pendingTimeout = setTimeout(() => {
              this.checkStatus(url);
            }, 2000);
          }
        })
        .catch(error => {
          // handle error
          console.log(error);
        });
    }
  },
  watch: {
    handle() {
      this.combineFile();
    },
    applied() {
      this.combineFile();
    }
  }
};

const PdfPicker = {
  components: { Picker },
  template: `<div><picker @done="onFileUploaded" @error="onFileError" :accept="['application/pdf']" mode="overlay"></picker></div>`,
  methods: {
    onFileUploaded(file) {
      this.$store.commit('SET_PDF_FILE', file);
      console.log('File Uploaded', file);
    },
    onFileError(file) {
      console.log('File error', file);
    }
  }
};

const PdfPreview = {
  template: `<div>
    <div id="pdfPreview" class="sc-preview-wrapper"></div>
  </div>`,
  computed: {
    handle() {
      return this.$store.getters.pdfFile;
    }
  },
  mounted() {
    this.generate();
  },
  methods: {
    generate() {
      if (!this.handle) {
        return;
      }

      document.getElementById('pdfPreview').innerHTML = '';
      this.$root.client.preview(this.handle, { id: 'pdfPreview' });
    }
  },
  watch: {
    handle() {
      this.generate();
    }
  }
};

const TagsPicker = {
  components: { Picker },
  template: `<div><picker @done="onFileUploaded" @error="onFileError" :accept="['image/*']" mode="overlay"></picker></div>`,
  methods: {
    onFileUploaded(file) {
      this.$store.commit('SET_TAGS_FILE', file);
      console.log('File Uploaded', file);
    },
    onFileError(file) {
      console.log('File error', file);
    }
  }
};

const TagsPreview = {
  template: `<div :class="{'isLoading': isLoading}">
    <img :src="imgSrc" v-if="imgSrc"/>
    <div>
      <pre class="sc-pre">{{JSON.stringify(tags, null, 2)}} {{JSON.stringify(sfw, null, 2)}}</pre>
    </div>
  </div>`,
  data() {
    return {
      isTasLoading: false,
      isSfwLoading: false,
      tags: {},
      sfw: {},
      imgSrc: null
    };
  },
  computed: {
    isLoading() {
      return this.isTasLoading || this.isSfwLoading;
    },
    handle() {
      return this.$store.getters.tagsFile;
    }
  },
  mounted() {
    this.generate();
    if (this.handle) {
      const fl = new filestack.Filelink(this.handle, this.$root.apikey);
      if (this.$root.security) {
        fl.security(this.$root.security);
      }

      this.imgSrc = fl;
    }
  },
  methods: {
    generate() {
      if (!this.handle) {
        return;
      }

      this.getTags();
      this.getSfw();
    },
    getTags() {
      this.isTasLoading = true;
      const fl = new filestack.Filelink(this.handle, this.$root.apikey);

      if (this.$root.security) {
        fl.security(this.$root.security);
      }

      this.imgSrc = fl.toString();

      fl.tags();

      axios
        .get(fl)
        .then(res => {
          const responseBody = res.data;
          this.tags = responseBody.tags.auto;
          this.isTasLoading = false;
        });
    },
    getSfw() {
      this.isSfwLoading = true;
      const fl = new filestack.Filelink(this.handle, this.$root.apikey);

      if (this.$root.security) {
        fl.security(this.$root.security);
      }

      fl.sfw();

      axios
        .get(fl)
        .then(res => {
          const responseBody = res.data;
          this.sfw = responseBody;
          this.isSfwLoading = false;
        });
    }
  },
  watch: {
    handle() {
      this.generate();
    }
  }
};
	
// <?php 
// 	$secret = 'YLYHKOTCLNDL5MSC62IK3OG54M';
// $time = strtotime('now') * 1000 + 3600000 * 4;

// $policy = '{"call":["pick","read","store","convert"], "expiry": '.$time. '}';
// $policy = base64_encode($policy);
// $signature = hash_hmac('sha256', $policy, $secret);
// ?>

var app = new Vue({
  el: '#productShowcase',
  store,
  components: { MainPicker, ImagePicker, ImagePreview, DocumentPicker, DocumentPreview, AvPicker, AvPreview, PdfPreview, PdfPicker, TagsPreview, TagsPicker },
  created() {
    // const security = {
    //   policy: '<?php echo $policy;?>',
    //   signature: '<?php echo $signature;?>'
    // };

    this.apikey = 'ARVNFDkIFTCy2nOXvYSoLz';
    this.client = filestack.init(this.apikey, {
      // security
    });
    // this.security = security;
  },
  data: {
    client: null,
    message: 'Hello Vue!'
  }
});