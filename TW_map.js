import { bindMapClickEvents, bindPolygonClickEvents } from '/static/map-interaction.js';

const stationUrl = "http://3.27.111.145:8000/api/aqi"; // 測站API

const mapLC = L.map("mapLC").setView([26.15, 119.94], 8.5); // 連江
const mapKM = L.map("mapKM").setView([24.44, 118.32], 8.5); // 金門
const mapPH = L.map("mapPH").setView([23.56, 119.57], 8.5); // 澎湖
const mapTW = L.map("mapTW").setView([23.5, 121], 8); // 台灣本島
const geoLayers = [];

// 讀取並處理 TopoJSON
const url = "/static/TW_region.json";
function loadTopoJSON(url) {
  fetch(url)
    .then((response) => response.json())
    .then((topoData) => {
      const objectName = Object.keys(topoData.objects)[0]; // 取第一個 object
      const geojson = topojson.feature(topoData, topoData.objects[objectName]);
      //   console.log(geojson);

      const islands = ["連江縣", "金門縣", "澎湖縣"];
      const islandsGeoJSON = geojson.features.filter((feature) =>
        islands.includes(feature.properties.COUNTYNAME)
      );
      const taiwanMainlandGeoJSON = geojson.features.filter(
        (feature) => !islands.includes(feature.properties.COUNTYNAME)
      );

      // 繪製地圖
      const twLayer = L.geoJSON(taiwanMainlandGeoJSON, {
        style: style,
        onEachFeature: onEachFeature,
      }).addTo(mapTW);
      geoLayers.push(twLayer);

      const lcLayer = L.geoJSON(
        islandsGeoJSON.filter(
          (feature) => feature.properties.COUNTYNAME === "連江縣"
        ),
        { style: style, onEachFeature: onEachFeature }
      ).addTo(mapLC);
      geoLayers.push(lcLayer);
      addMapTitle(mapLC, "連江縣");

      const kmLayer = L.geoJSON(
        islandsGeoJSON.filter(
          (feature) => feature.properties.COUNTYNAME === "金門縣"
        ),
        { style: style, onEachFeature: onEachFeature }
      ).addTo(mapKM);
      geoLayers.push(kmLayer);
      addMapTitle(mapKM, "金門縣");

      const phLayer = L.geoJSON(
        islandsGeoJSON.filter(
          (feature) => feature.properties.COUNTYNAME === "澎湖縣"
        ),
        { style: style, onEachFeature: onEachFeature }
      ).addTo(mapPH);
      geoLayers.push(phLayer);
      addMapTitle(mapPH, "澎湖縣");

      // 綁定地圖縣市 Polygon 點擊事件
      bindPolygonClickEvents(geoLayers);
    })
    .catch((error) => console.error("讀取或轉換 TopoJSON 錯誤:", error));
}

// AQI分級
function getAQIColor(AQIstatus) {
  switch (AQIstatus) {
    case "良好":
      return "rgb(0, 152, 101)";
    case "普通":
      return "rgb(255, 251, 38)";
    case "對敏感族群不健康":
      return "rgb(255, 152, 53)";
    case "對所有族群不健康":
      return "rgb(202, 0, 52)";
    case "非常不健康":
      return "rgb(103, 0, 153)";
    case "危害":
      return "rgb(126, 1, 35)";
    default:
      return "#999999";
  }
}

// 取得觀測站資訊
function loadStation() {
  fetch(stationUrl)
    .then((response) => response.json())
    .then((data) => {
      //   console.log(data);
      let stations = data.records;
      console.log(stations);

      const markerLayer = L.layerGroup().addTo(mapTW);

      for (let i = 0; i < stations.length; i++) {
        let station = stations[i];
        let lat = parseFloat(station.latitude);
        let lon = parseFloat(station.longitude);
        // let siteName = station.sitename;
        let siteCounty = station.county;
        let AQIstatus = station.status;
        let AQIcolor = getAQIColor(AQIstatus);
        // console.log(siteName, siteCounty, lat, lon);

        let targetMap;

        if (siteCounty === "澎湖縣") {
          targetMap = mapPH;
        } else if (siteCounty === "金門縣") {
          targetMap = mapKM;
        } else if (siteCounty === "連江縣") {
          targetMap = mapLC;
        } else {
          targetMap = mapTW;
        }

        // 加入標記到對應的地圖
        const marker = L.circleMarker([lat, lon], {
          radius: 8,
          fillColor: AQIcolor,
          color: "#ffffff",
          weight: 1,
          fillOpacity: 0.8,
          customData: {
            city: siteCounty,
            siteName: station.sitename
          }
        }).addTo(targetMap);

        if (targetMap === mapTW) {
          markerLayer.addLayer(marker);
        }
        //   .bindPopup(
        //     `<strong>${siteName}</strong><br>AQI：${station.aqi}<br>狀態：${AQIstatus}`
        //   );
      }

      bindMapClickEvents(markerLayer);
    })
    .catch((error) => console.error("載入觀測站失敗:", error));
}

// 設定地圖樣式
function style() {
  return {
    fillColor: "#3388ff",
    weight: 1,
    opacity: 1,
    color: "white",
    fillOpacity: 0.5,
  };
}

// 滑鼠移入
function highlightFeature(e) {
  let layer = e.target;
  layer.setStyle({
    weight: 2,
    color: "white",
    fillOpacity: 0.7,
    fillColor: "#003060",
  });
}

// 滑鼠移出
function resetHighlight(e) {
  let layer = e.target;

  for (let i = 0; i < geoLayers.length; i++) {
    let geo = geoLayers[i];
    if (geo.hasLayer(layer)) {
      geo.resetStyle(layer);
      break;
    }
  }
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
  });
}

// add 離島地圖名稱
function addMapTitle(map, titleText) {
  let titleControl = L.control({ position: "bottomleft" });

  titleControl.onAdd = function () {
    const div = L.DomUtil.create("div", "map-name");
    const bold = document.createElement("b");
    const text = document.createTextNode(titleText);
    bold.appendChild(text);
    div.appendChild(bold);
    return div;
  };

  titleControl.addTo(map);
}

// add 圖例說明
const legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  let div = L.DomUtil.create("div", "legendInfo");
  let grades = [
    { status: "良好", color: "rgb(0, 152, 101)" },
    { status: "普通", color: "rgb(255, 251, 38)" },
    { status: "對敏感族群不健康", color: "rgb(255, 152, 53)" },
    { status: "對所有族群不健康", color: "rgb(202, 0, 52)" },
    { status: "非常不健康", color: "rgb(103, 0, 153)" },
    { status: "危害", color: "rgb(126, 1, 35)" },
    { status: "系統偵測中", color: "#999999" },
  ];

  for (let i = 0; i < grades.length; i++) {
    let container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";

    let icon = document.createElement("i");
    icon.style.background = grades[i].color;
    icon.style.width = "12px";
    icon.style.height = "12px";
    icon.style.marginRight = "6px";
    icon.style.display = "inline-block";
    let text = document.createTextNode(grades[i].status);

    container.appendChild(icon);
    container.appendChild(text);

    div.appendChild(container);
  }

  return div;
};
legend.addTo(mapTW);

// 載入TopoJSON
loadTopoJSON(url);
loadStation();
