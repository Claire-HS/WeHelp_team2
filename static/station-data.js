const apiUrl = "http://3.27.111.145:8000/api/aqi";

let allData = [];

/* ===========================
   API Handling
=========================== */

function getLatestData(records) {
  const latestDataMap = {};

  records.forEach(record => {
    const siteName = record.sitename;
    const recordDate = new Date(record.datacreationdate);

    if (!latestDataMap[siteName] || recordDate > new Date(latestDataMap[siteName].datacreationdate)) {
      latestDataMap[siteName] = record;
    }
  });

  return Object.values(latestDataMap);
}

async function fetchData() {
  const response = await fetch(apiUrl);
  const result = await response.json();
  allData = getLatestData(result.records);

  const citySelector = document.getElementById("citySelector");
  const siteSelector = document.getElementById("siteSelector");

  citySelector.innerHTML = '';
  siteSelector.innerHTML = '';
  siteSelector.disabled = false;

  const cities = [...new Set(allData.map(record => record.county))];
  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelector.appendChild(option);
  });

  if (cities.length > 0) {
    citySelector.value = cities[0];
    renderSitesAndData(cities[0]);
  }

  citySelector.addEventListener("change", function () {
    renderSitesAndData(this.value);
  });

  siteSelector.addEventListener("change", function () {
    const selectedCity = citySelector.value;
    const selectedSite = siteSelector.value;
    const selectedRecord = allData.find(record => record.county === selectedCity && record.sitename === selectedSite);
    if (selectedRecord) {
      renderDataCards([selectedRecord]);
    }
  });
}

function renderSitesAndData(selectedCity) {
  const siteSelector = document.getElementById("siteSelector");
  const filteredSites = allData.filter(record => record.county === selectedCity);

  siteSelector.innerHTML = '';
  filteredSites.forEach(record => {
    const option = document.createElement("option");
    option.value = record.sitename;
    option.textContent = record.sitename;
    siteSelector.appendChild(option);
  });

  if (filteredSites.length > 0) {
    siteSelector.value = filteredSites[0].sitename;
    renderDataCards([filteredSites[0]]);
  } else {
    renderDataCards([]);
  }
}

/* ===========================
   DOM Rendering
=========================== */

function renderDataCards(data) {
  const stationDetail = document.getElementById("stationDetail");
  stationDetail.innerHTML = "";

  if (data.length === 0) {
    stationDetail.style.display = "none";
    return;
  }

  const record = data[0];
  const aqi = parseInt(record.aqi);
  const status = getAqiStatus(aqi);
  const aqiClass = getAqiClass(aqi);

  stationDetail.style.display = "block";

  stationDetail.innerHTML = `
    <h2>${record.county} / ${record.sitename}</h2>
    <p style="font-size: 12px; color: #666;">更新時間：${record.publishtime || record.publishTime || '-'}</p>
    <div class="aqi-circle ${aqiClass}">
      <p class="aqi-label">空污指標AQI</p>
      <p class="aqi-value">${aqi || '-'}</p>
      <p class="aqi-status">${status || '-'}</p>
    </div>
    <div class="detail-table">
      <div>
        <strong>PM2.5<br />細懸浮微粒(μg/m3)</strong>
        <div class="value-block">
          <span>移動平均：<span class="value">${record["pm2.5_avg"] || '-'}</span></span>
          <span>小時濃度：<span class="value">${record["pm2.5"] || '-'}</span></span>
        </div>
      </div>
      <div>
        <strong>PM10<br />懸浮微粒(μg/m3)</strong>
        <div class="value-block">
          <span>移動平均：<span class="value">${record.pm10_avg || '-'}</span></span>
          <span>小時濃度：<span class="value">${record.pm10 || '-'}</span></span>
        </div>
      </div>
      <div>
        <strong>O₃<br />臭氧(ppb)</strong>
        <div class="value-block">
          <span>O₃移平均：<span class="value">${record.o3_8hr || '-'}</span></span>
          <span>小時濃度：<span class="value">${record.o3 || '-'}</span></span>
        </div>
      </div>
      <div>
        <strong>CO<br />一氧化碳(ppm)</strong>
        <div class="value-block">
          <span>CO移平均：<span class="value">${record.co_8hr || '-'}</span></span>
          <span>小時濃度：<span class="value">${record.co || '-'}</span></span>
        </div>
      </div>
      <div>
        <strong>SO₂<br />二氧化硫(ppb)</strong>
        <div class="value-block">
          <span>小時濃度：<span class="value">${record.so2 || '-'}</span></span>
        </div>
      </div>
      <div>
        <strong>NO₂<br />二氧化氮(ppb)</strong>
        <div class="value-block">
          <span>小時濃度：<span class="value">${record.no2 || '-'}</span></span>
        </div>
      </div>
    </div>
  `;
}


/* ===========================
   Utility Functions
=========================== */

function getAqiColor(aqi) {
  if (aqi <= 50) return "#00e400"; // 綠色
  if (aqi <= 100) return "#ffdd00"; // 黃色
  if (aqi <= 150) return "#ff7e00"; // 橘色
  if (aqi <= 200) return "#ff0000"; // 紅色
  if (aqi <= 300) return "#8f3f97"; // 紫色
  return "#7e0023"; // 褐紅色
}

function getAqiStatus(aqi) {
  if (aqi <= 50) return "良好";
  if (aqi <= 100) return "普通";
  if (aqi <= 150) return "對敏感族群不良";
  if (aqi <= 200) return "不健康";
  if (aqi <= 300) return "非常不健康";
  return "危害";
}

function getAqiClass(aqi) {
  if (aqi <= 50) return "aqi-good";
  if (aqi <= 100) return "aqi-moderate";
  if (aqi <= 150) return "aqi-unhealthy-sensitive";
  if (aqi <= 200) return "aqi-unhealthy";
  if (aqi <= 300) return "aqi-very-unhealthy";
  return "aqi-hazardous";
}


/* ===========================
   Initialization
=========================== */

// Fetch data and initialize page on load
fetchData();

export { allData, renderDataCards, renderSitesAndData };
