import {
  fetchData,
  renderDataCards,
  renderSitesAndData,
} from "./station-data.js";

// 綁定 marker 點擊
function bindMapClickEvents(markersLayerGroup) {
  if (!markersLayerGroup) {
    console.error("bindMapClickEvents 參數錯誤");
    return;
  }

  markersLayerGroup.eachLayer(function (marker) {
    marker.on("click", function (e) {
      const markerData = e.target.options.customData;
      if (markerData) {
        handleMarkerClick(markerData.city, markerData.siteName);
      } else {
        console.warn("點擊的 marker 沒有 customData");
      }
    });
  });
}

// 處理 marker 點擊邏輯
async function handleMarkerClick(city, siteName) {
  const allData = await fetchData();
  const citySelector = document.getElementById("citySelector");
  const siteSelector = document.getElementById("siteSelector");
  const selectorCard = document.querySelector(".selector-card");

  if (citySelector && citySelector.value !== city) {
    citySelector.value = city;
    renderSitesAndData(city);
  }

  setTimeout(() => {
    const filteredSites = allData.filter((record) => record.county === city);
    if (filteredSites.length > 0 && siteSelector) {
      siteSelector.innerHTML = "";
      filteredSites.forEach((record) => {
        const option = document.createElement("option");
        option.value = record.sitename;
        option.textContent = record.sitename;
        siteSelector.appendChild(option);
      });

      siteSelector.value = siteName;

      const selectedRecord = filteredSites.find(
        (record) => record.sitename === siteName
      );
      if (selectedRecord) {
        renderDataCards([selectedRecord]);
      }
    }
  }, 0);
}

// 綁定地圖縣市區域 Polygon 點擊事件
function bindPolygonClickEvents(geoLayers) {
  geoLayers.forEach((layerGroup) => {
    layerGroup.eachLayer((layer) => {
      layer.on("click", function (e) {
        const countyName = e.target.feature.properties.COUNTYNAME;
        handlePolygonClick(countyName);
      });
    });
  });
}

async function handlePolygonClick(city) {
  const allData = await fetchData();
  const citySelector = document.getElementById("citySelector");
  const siteSelector = document.getElementById("siteSelector");
  const selectorCard = document.querySelector(".selector-card");

  if (citySelector && citySelector.value !== city) {
    citySelector.value = city;
    renderSitesAndData(city);
  }

  setTimeout(() => {
    const filteredSites = allData.filter((record) => record.county === city);
    if (filteredSites.length > 0 && siteSelector) {
      siteSelector.innerHTML = "";
      filteredSites.forEach((record) => {
        const option = document.createElement("option");
        option.value = record.sitename;
        option.textContent = record.sitename;
        siteSelector.appendChild(option);
      });

      siteSelector.value = filteredSites[0].sitename;
      renderDataCards([filteredSites[0]]);
    }
  }, 0);
}

export { bindMapClickEvents, bindPolygonClickEvents };
