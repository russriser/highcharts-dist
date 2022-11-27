import React, { useEffect } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { FileSystem } from 'expo-file-system';
import HighchartsModules from './HighchartsModules';

const win = Dimensions.get('window');
const stringifiedScripts = {};

let cdnPath = 'code.highcharts.com/';
let httpProto = 'http://';

export default function HighchartsReactNative(props) {
  let { height, width } = useWindowDimensions();

  if (!!props.styles) {
    const userStyles = StyleSheet.flatten(props.styles);
    const { width: w, height: h } = userStyles;
    width = w;
    height = h;
  }

  const useCDN = props.useCDN || false;
  const modules = props.modules || [];
  const setOptions = props.setOptions || {};

  const [hcModulesReady, setHcModulesReady] = React.useState(false);
  const [layoutHTML, setLayoutHTML] = React.useState(null);
  const [renderedOnce, setRenderedOnce] = React.useState(false);

  const webviewRef = React.useRef(null);

  if (props.useSSL) {
    httpProto = 'https://';
  }

  if (typeof props.useCDN === 'string') {
    cdnPath = props.useCDN;
  }

  useEffect(() => {
    setHcAssets(useCDN);
  }, []);

  //   static getDerivedStateFromProps(props, state) {
  //     let width = Dimensions.get('window').width;
  //     let height = Dimensions.get('window').height;
  //     if (!!props.styles) {
  //       const userStyles = StyleSheet.flatten(props.styles);
  //       const { width: w, height: h } = userStyles;
  //       width = w;
  //       height = h;
  //     }
  //     return {
  //       width: width,
  //       height: height,
  //     };
  //   }

  const setHcAssets = async (useCDN) => {
    try {
      await setLayout();
      await addScript('highcharts', null, useCDN);
      await addScript('highcharts-more', null, useCDN);
      await addScript('highcharts-3d', null, useCDN);
      for (const mod of modules) {
        await addScript(mod, true, useCDN);
      }
      setHcModulesReady(true);
    } catch (error) {
      console.error('Failed to fetch scripts or layout. ' + error.message);
    }
  };

  //   setHcAssets = async (useCDN) => {
  //     try {
  //       await this.setLayout();
  //       await this.addScript('highcharts', null, useCDN);
  //       await this.addScript('highcharts-more', null, useCDN);
  //       await this.addScript('highcharts-3d', null, useCDN);
  //       for (const mod of this.state.modules) {
  //         await this.addScript(mod, true, useCDN);
  //       }
  //       this.setState({
  //         hcModulesReady: true,
  //       });
  //     } catch (error) {
  //       console.error('Failed to fetch scripts or layout. ' + error.message);
  //     }
  //   };

  const getAssetAsString = async (asset) => {
    const downloadedModules = await FileSystem.readDirectoryAsync(
      FileSystem.cacheDirectory
    );
    let fileName = 'ExponentAsset-' + asset.hash + '.' + asset.type;

    if (!downloadedModules.includes(fileName)) {
      await asset.downloadAsync();
    }

    return await FileSystem.readAsStringAsync(
      FileSystem.cacheDirectory + fileName
    );
  };

  //   getAssetAsString = async (asset) => {
  //     const downloadedModules = await FileSystem.readDirectoryAsync(
  //       FileSystem.cacheDirectory
  //     );
  //     let fileName = 'ExponentAsset-' + asset.hash + '.' + asset.type;

  //     if (!downloadedModules.includes(fileName)) {
  //       await asset.downloadAsync();
  //     }

  //     return await FileSystem.readAsStringAsync(
  //       FileSystem.cacheDirectory + fileName
  //     );
  //   };

  const addScript = async (name, isModule, useCDN) => {
    if (useCDN) {
      const response = await fetch(
        httpProto + cdnPath + (isModule ? 'modules/' : '') + name + '.js'
      ).catch((error) => {
        throw error;
      });
      stringifiedScripts[name] = await response.text();
    } else {
      const script = Asset.fromModule(
        isModule && name !== 'highcharts-more' && name !== 'highcharts-3d'
          ? HighchartsModules.modules[name]
          : HighchartsModules[name]
      );
      stringifiedScripts[name] = await getAssetAsString(script);
    }
  };

  //   addScript = async (name, isModule, useCDN) => {
  //     if (useCDN) {
  //       const response = await fetch(
  //         httpProto + cdnPath + (isModule ? 'modules/' : '') + name + '.js'
  //       ).catch((error) => {
  //         throw error;
  //       });
  //       stringifiedScripts[name] = await response.text();
  //     } else {
  //       const script = Asset.fromModule(
  //         isModule && name !== 'highcharts-more' && name !== 'highcharts-3d'
  //           ? HighchartsModules.modules[name]
  //           : HighchartsModules[name]
  //       );
  //       stringifiedScripts[name] = await this.getAssetAsString(script);
  //     }
  //   };

  const setLayout = async () => {
    const indexHtml = Asset.fromModule(
      require('../highcharts-layout/index.html')
    );

    setLayoutHTML(await getAssetAsString(indexHtml));
  };

  //   setLayout = async () => {
  //     const indexHtml = Asset.fromModule(
  //       require('../highcharts-layout/index.html')
  //     );

  //     this.setState({
  //       layoutHTML: await this.getAssetAsString(indexHtml),
  //     });
  //   };

  //   constructor(props) {
  //     super(props);

  //     if (props.useSSL) {
  //       httpProto = 'https://';
  //     }

  //     if (typeof props.useCDN === 'string') {
  //       cdnPath = props.useCDN;
  //     }

  //     // extract width and height from user styles
  //     const userStyles = StyleSheet.flatten(props.styles);

  //     this.state = {
  //       width: userStyles.width || win.width,
  //       height: userStyles.height || win.height,
  //       chartOptions: props.options,
  //       useCDN: props.useCDN || false,
  //       modules: props.modules || [],
  //       setOptions: props.setOptions || {},
  //       renderedOnce: false,
  //       hcModulesReady: false,
  //     };
  //     this.webviewRef = null;

  //     this.setHcAssets(this.state.useCDN);
  //   }

  //   componentDidUpdate() {
  //     this.webviewRef &&
  //       this.webviewRef.postMessage(this.serialize(this.props.options, true));
  //   }

  useEffect(() => setRenderedOnce(true), []);

  //   componentDidMount() {
  //     this.setState({ renderedOnce: true });
  //   }

  /**
   * Convert JSON to string. When is updated, functions (like events.load)
   * is not wrapped in quotes.
   */

  const serialize = (chartOptions, isUpdate) => {
    let hcFunctions = {},
      serializedOptions,
      i = 0;

    serializedOptions = JSON.stringify(chartOptions, function (val, key) {
      var fcId = '###HighchartsFunction' + i + '###';

      // set reference to function for the later replacement
      if (typeof key === 'function') {
        hcFunctions[fcId] = key.toString();
        i++;
        return isUpdate ? key.toString() : fcId;
      }

      return key;
    });

    // replace ids with functions.
    if (!isUpdate) {
      Object.keys(hcFunctions).forEach(function (key) {
        serializedOptions = serializedOptions.replace(
          '"' + key + '"',
          hcFunctions[key]
        );
      });
    }

    return serializedOptions;
  };

  //   serialize(chartOptions, isUpdate) {
  //     var hcFunctions = {},
  //       serializedOptions,
  //       i = 0;

  //     serializedOptions = JSON.stringify(chartOptions, function (val, key) {
  //       var fcId = '###HighchartsFunction' + i + '###';

  //       // set reference to function for the later replacement
  //       if (typeof key === 'function') {
  //         hcFunctions[fcId] = key.toString();
  //         i++;
  //         return isUpdate ? key.toString() : fcId;
  //       }

  //       return key;
  //     });

  //     // replace ids with functions.
  //     if (!isUpdate) {
  //       Object.keys(hcFunctions).forEach(function (key) {
  //         serializedOptions = serializedOptions.replace(
  //           '"' + key + '"',
  //           hcFunctions[key]
  //         );
  //       });
  //     }

  //     return serializedOptions;
  //   }

  if (hcModulesReady) {
    // const setOptions = this.state.setOptions;
    const runFirst = `
                window.data = \"${props.data ? props.data : null}\";
                var modulesList = ${JSON.stringify(modules)};
                var readable = ${JSON.stringify(stringifiedScripts)}

                function loadScripts(file, callback, redraw) {
                    var hcScript = document.createElement('script');
                    hcScript.innerHTML = readable[file]
                    document.body.appendChild(hcScript);

                    if (callback) {
                        callback.call();
                    }

                    if (redraw) {
                        Highcharts.setOptions(${serialize(setOptions)});
                        Highcharts.chart("container", ${serialize(
                          props.options
                        )});
                    }
                }

                loadScripts('highcharts', function () {
                    var redraw = modulesList.length > 0 ? false : true;
                    loadScripts('highcharts-more', function () {
                        if (modulesList.length > 0) {
                            for (var i = 0; i < modulesList.length; i++) {
                                if (i === (modulesList.length - 1)) {
                                    redraw = true;
                                } else {
                                    redraw = false;
                                }
                                loadScripts(modulesList[i], undefined, redraw, true);
                            }
                        }
                    }, redraw);
                }, false);
            `;

    webviewRef.current.postMessage(serialize(props.options), true);
    // Create container for the chart
    return (
      <View style={[props.styles, { width, height }]}>
        <WebView
          ref={webviewRef}
          onMessage={
            props.onMessage
              ? (event) => props.onMessage(event.nativeEvent.data)
              : () => {}
          }
          source={{
            html: layoutHTML,
          }}
          injectedJavaScript={runFirst}
          originWhitelist={['*']}
          automaticallyAdjustContentInsets={true}
          allowFileAccess={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          useWebKit={true}
          scrollEnabled={false}
          mixedContentMode="always"
          allowFileAccessFromFileURLs={true}
          startInLoadingState={props.loader}
          style={props.webviewStyles}
          androidHardwareAccelerationDisabled
          {...props.webviewProps}
        />
      </View>
    );
  } else {
    return <View></View>;
  }
}
