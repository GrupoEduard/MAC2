import { find, filter, isString, keys } from 'lodash'
const EventEmitter = require('events');
const chokidar = require("chokidar");
let instance = null

export default class LocalWatcher extends EventEmitter {

    constructor(unidad) {
        super();
        this.unidad = unidad;
        this.interval = false;
        this.initialized = false;
        this.localQueue = [];
        this.buffer = {}

    }
    init() {
        if (!this.initialized) {
            this.startWatching();
            this.initialized = true;
        }
    }

    startWatching() {
        let pathArray = []
        if (this.unidad.ruta_archivos) pathArray.push(this.unidad.ruta_archivos)
        if (this.unidad.ruta_descargables) pathArray.push(this.unidad.ruta_descargables)
        this.start(pathArray)
    }

    getChokidar(folder) {
        return chokidar.watch(folder, {
            ignored: /(^|[/\\])\..*(\.tmp$)/,
            persistent: true,

            ignoreInitial: false,
            followSymlinks: true,
            disableGlobbing: false,

            usePolling: true,
            alwaysStat: false,
            awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
            },

            ignorePermissionErrors: false,
            atomic: true // or a custom 'atomicity delay', in milliseconds (default 100)
        });
    }

    start(folder) {
        this.watcher = this.getChokidar(folder)

        this.watcher.on('add', (path, stats) => this.queue(path, 'add', stats))
            .on('change', (path, stats) => this.queue(path, 'change', stats))
            .on('unlink', path => this.queue(path, 'unlink'))
            .on('addDir', (path, stats) => this.queue(path, 'addDir', stats))
            .on('unlinkDir', path => this.queue(path, 'unlinkDir'))
            .on('ready', () => this.queue(null, 'ready'))
            .on('error', error => log(`Watcher error: ${error}`));
    }

    stopWatching() {
        this.closed = true;
        this.watcher.close();
        if(this.interval) clearInterval(this.interval)
    }

    async queue(path, event, stats) {
        this.localQueue.push([event, path, stats]);
        if (this.localQueue.length > 1) return
        while (this.localQueue.length > 0 && !this.closed) {
            await this.dealWithQueuedEvent(this.localQueue[0]);
            this.localQueue.shift();
        }
    }

    async dealWithQueuedEvent([event, path, stats]) {
        let $this = this
        let folder = _.replace(path, this.unidad.ruta_archivos, '')
        if (this.unidad.ruta_descargables) folder = _.replace(folder, this.unidad.ruta_descargables, '')
        if (event === "ready") {
            this.emit('ready')
            this.interval = setInterval(async function(){
                let filter_buffer = filter($this.buffer,(f)=>isString(f.event))
                for(let item of filter_buffer){

                    if(item.delete){
                       if(item.event === 'unlinkDir'){
                           await $this.carpeta.eliminado($this.unidad,item.folder, item.path)
                       }else{
                           await $this.archivo.eliminado($this.unidad,item.folder, item.path)
                       }

                    }else{
                        if(item.event === 'addDir'){
                            await $this.createCacheDir(item.folder, item.path, item.stats)
                        }else{
                            await $this.createCacheFile(item.folder, item.path, item.stats)
                        }
                    }
                    // item.event = false
                    $this.buffer[item.stats.ino]['event'] = 0
                }

            }, 5000);
            return;
        }
        if (folder) this.bufferChange(event,folder, path, stats)
    }

    bufferChange(event,folder, path, stats= 0){
        if(stats === 0){
            let eliminar = find(this.buffer, function(o) { return o.path === path; });
            eliminar.delete = ['unlinkDir', 'unlink'].includes(event)
            eliminar.event = event
            this.buffer[eliminar.stats.ino] = {...eliminar}
            return
        }
        let crear = {folder, path,stats}
        crear.delete = (['unlinkDir', 'unlink'].includes(event))
        this.buffer[crear.stats.ino] = {event, ...crear}
    }

    async createCacheDir(folder, path, stats) {
        let save = await this.carpeta.init(this.unidad, folder, path, stats)
        this.delete = false;
        if (save) {
            await this.carpeta.save()
            let crear = this.buffer[stats.ino]
            crear.event = null
            this.buffer[stats.ino] = {...crear}
            this.emit('addDir')
        }
    }

    async createCacheFile(folder, path, stats) {
        let save = await this.archivo.init(this.unidad, folder, path, stats)
        if (save) {
            await this.archivo.save()
            let crear = this.buffer[stats.ino]
            crear.event = null
            this.buffer[stats.ino] = {...crear}
            this.emit('add')
        }
    }
}

