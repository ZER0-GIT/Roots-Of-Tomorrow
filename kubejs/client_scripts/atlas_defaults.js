const AtlasBridge = Java.loadClass('dev.ryan.tfcatlas.client.XaeroBridge')
const AtlasProfiles = Java.loadClass('dev.ryan.tfcatlas.client.Profiles')
const AtlasProfile = Java.loadClass('dev.ryan.tfcatlas.client.Profile')
const AtlasMinecraft = Java.loadClass('net.minecraft.client.Minecraft')
const AtlasTick = Java.loadClass('net.neoforged.neoforge.client.event.ClientTickEvent$Pre')
const AtlasScreenInit = Java.loadClass('net.neoforged.neoforge.client.event.ScreenEvent$Init$Post')
const AtlasPriority = Java.loadClass('net.neoforged.bus.api.EventPriority')

let atlasLastWorld = null
let atlasErrorReported = false

function initializeAtlasProfile() {
  var minecraft = AtlasMinecraft.getInstance()
  if (minecraft.player == null || minecraft.level == null) {
    atlasLastWorld = null
    return
  }

  try {
    var world = AtlasBridge.liveWorld()
    if (world == null || world == atlasLastWorld) return

    var path = 'config/tfcatlas/profiles/' + AtlasProfiles.hash(world) + '.json'
    if (JsonIO.read(path) == null) {
      var profile = new AtlasProfile()
      profile.mode = 'Explored only'
      profile.display = 'Overlay'
      profile.diskCache = false
      AtlasProfiles.save(world, profile)
    }
    atlasLastWorld = world
    atlasErrorReported = false
  } catch (error) {
    if (!atlasErrorReported) {
      console.error('Could not initialize TFC Atlas defaults: ' + error)
      atlasErrorReported = true
    }
  }
}

NativeEvents.onEvent(AtlasPriority.HIGHEST, AtlasTick, initializeAtlasProfile)
NativeEvents.onEvent(AtlasPriority.HIGHEST, AtlasScreenInit, initializeAtlasProfile)
