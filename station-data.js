const apiUrl =
  "https://5wqz99uez1.execute-api.ap-southeast-2.amazonaws.com/v1/api/aqi";

/* === API Handling === */

function getLatestData(records) {
  const latestDataMap = {};

  records.forEach((record) => {
    const siteName = record.sitename;
    const recordDate = new Date(record.datacreationdate);

    if (
      !latestDataMap[siteName] ||
      recordDate > new Date(latestDataMap[siteName].datacreationdate)
    ) {
      latestDataMap[siteName] = record;
    }
  });

  return Object.values(latestDataMap);
}

let allData = null; // 存資料
let fetchPromise = null; // 存 fetch 中的 Promise（避免重複執行）

async function fetchData() {
  if (allData) return allData; // 已經有資料，直接回傳
  if (fetchPromise) return fetchPromise; // 正在抓資料中，回傳同一個 Promise

  fetchPromise = fetch(apiUrl)
    .then((res) => res.json())
    .then((result) => {
      allData = getLatestData(result.records);
      return allData;
    })
    .catch((err) => {
      console.error("fetchData 錯誤：", err);
      fetchPromise = null;
      throw err;
    });

  return fetchPromise;
}

async function init() {
  const allData = await fetchData(apiUrl);

  const citySelector = document.getElementById("citySelector");
  const siteSelector = document.getElementById("siteSelector");

  citySelector.innerHTML = "";
  siteSelector.innerHTML = "";
  siteSelector.disabled = false;

  const cities = [...new Set(allData.map((record) => record.county))];
  cities.forEach((city) => {
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
    const selectedRecord = allData.find(
      (record) =>
        record.county === selectedCity && record.sitename === selectedSite
    );
    if (selectedRecord) {
      renderDataCards([selectedRecord]);
    }
  });
}

function renderSitesAndData(selectedCity) {
  const siteSelector = document.getElementById("siteSelector");
  const filteredSites = allData.filter(
    (record) => record.county === selectedCity
  );

  siteSelector.innerHTML = "";
  filteredSites.forEach((record) => {
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

/* === DOM Rendering === */

function renderDataCards(data) {
  const stationDetail = document.getElementById("stationDetail");
  stationDetail.innerHTML = "";

  if (data.length === 0) {
    stationDetail.style.display = "none";
    return;
  }

  const record = data[0];
  const aqi = parseInt(record.aqi);
  const status = getAqiStatus(record.status);
  const aqiClass = getAqiClass(record.status);

  stationDetail.style.display = "block";

  stationDetail.innerHTML = `
    <h2>${record.county} / ${record.sitename}</h2>
    <p style="font-size: 12px; color: #666;">更新時間：${
      record.publishtime || record.publishTime || "-"
    }</p>
    <div class="aqi-circle ${aqiClass}">
      <p class="aqi-label">空污指標AQI</p>
      <p class="aqi-value">${aqi || "-"}</p>
      <p class="aqi-status">${status || "-"}</p>
    </div>
    <div class="detail-table">
      <div>
        <strong>PM2.5<br />細懸浮微粒(μg/m3)</strong>
        <div class="value-block">
          <span>移動平均：<span class="value">${
            record["pm2.5_avg"] || "-"
          }</span></span>
          <span>小時濃度：<span class="value">${
            record["pm2.5"] || "-"
          }</span></span>
        </div>
      </div>
      <div>
        <strong>PM10<br />懸浮微粒(μg/m3)</strong>
        <div class="value-block">
          <span>移動平均：<span class="value">${
            record.pm10_avg || "-"
          }</span></span>
          <span>小時濃度：<span class="value">${
            record.pm10 || "-"
          }</span></span>
        </div>
      </div>
      <div>
        <strong>O₃<br />臭氧(ppb)</strong>
        <div class="value-block">
          <span>O₃移平均：<span class="value">${
            record.o3_8hr || "-"
          }</span></span>
          <span>小時濃度：<span class="value">${record.o3 || "-"}</span></span>
        </div>
      </div>
      <div>
        <strong>CO<br />一氧化碳(ppm)</strong>
        <div class="value-block">
          <span>CO移平均：<span class="value">${
            record.co_8hr || "-"
          }</span></span>
          <span>小時濃度：<span class="value">${record.co || "-"}</span></span>
        </div>
      </div>
      <div>
        <strong>SO₂<br />二氧化硫(ppb)</strong>
        <div class="value-block">
          <span>小時濃度：<span class="value">${record.so2 || "-"}</span></span>
        </div>
      </div>
      <div>
        <strong>NO₂<br />二氧化氮(ppb)</strong>
        <div class="value-block">
          <span>小時濃度：<span class="value">${record.no2 || "-"}</span></span>
        </div>
      </div>
    </div>
  `;
}

/* === Utility Functions === */

export function getAqiColor(aqi) {
  if (aqi <= 50) return "#009865";
  if (aqi <= 100) return "#FFFB26";
  if (aqi <= 150) return "#FF9835";
  if (aqi <= 200) return "#CA0034";
  if (aqi <= 300) return "#670087";
  return "#7E0123";
}

export function getAqiStatus(status) {
  const map = {
    良好: "良好",
    普通: "普通",
    對敏感族群不健康: "對敏感族群不良",
    對所有族群不健康: "不健康",
    非常不健康: "非常不健康",
    危害: "危害",
  };
  return map[status] || "未提供";
}

function getAqiClass(status) {
  const map = {
    良好: "aqi-good",
    普通: "aqi-moderate",
    對敏感族群不健康: "aqi-unhealthy-sensitive",
    對所有族群不健康: "aqi-unhealthy",
    非常不健康: "aqi-very-unhealthy",
    危害: "aqi-hazardous",
  };
  return map[status] || "aqi-unknown";
}

/* === Initialization === */
// Fetch data and initialize page on load
fetchData();
init();

export { fetchData, renderDataCards, renderSitesAndData };
