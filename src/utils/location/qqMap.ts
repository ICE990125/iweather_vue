/*************************
 *       腾讯地图         *
 *************************/
import Http from 'utils/http';

declare const qq: { maps: { Geolocation: any } };

export class QQMap {
  private baseUrl: string;
  private http: Http;
  private geolocation;

  constructor(private key: string) {
    this.baseUrl = '/qqmap'; // 配合 proxy 实现跨域

    this.http = new Http({
      baseUrl: this.baseUrl,
    });

    Http.setRequestInterceptors(this.http.ax, 'qqMap');
    Http.setQQMapResponseInterceptors(this.http.ax);

    // 获取定位
    this.geolocation = new qq.maps.Geolocation(
      this.key,
      process.env.VUE_APP_NAME
    );
  }

  // 获取位置信息
  addressInfo(): Promise<IMapData> {
    return new Promise((resolve, reject) => {
      this.geolocation.getLocation(
        (res: geoResult) => {
          const { lat, lng, city, addr } = res;
          resolve({
            latitude: lat, // 纬度
            longitude: lng, // 经度
            city: city, // 市
            address: addr, // 具体地址
          });
        },
        () => {
          reject();
        },
        {
          timeout: 10000, // 超时时间 10s
          failTipFlag: true, // 重新授权
        }
      );
    });
  }

  // 获取搜索建议
  searchSuggestions(keyword: string, region = ''): Promise<any> {
    return this.http.request({
      url: '/ws/place/v1/suggestion',
      method: 'GET',
      data: {
        key: this.key,
        keyword,
        region,
      },
    });
  }

  // 地址解析
  getAddressDetail(address: string): Promise<any> {
    return this.http.request({
      url: '/ws/geocoder/v1',
      method: 'GET',
      data: {
        key: this.key,
        address,
      },
    });
  }

  // 地址解析
  getLocationDetail(location: string): Promise<any> {
    return this.http.request({
      url: '/ws/geocoder/v1',
      method: 'GET',
      data: {
        key: this.key,
        location,
      },
    });
  }
}

/*************************
 *      腾讯地图绘制       *
 *************************/
export class DrawQQMap {
  private maker: TMap.MultiMarker | undefined;
  private map: TMap.Map | undefined;
  callback: (res: IMapData) => void;

  constructor(callback: (res: IMapData) => void) {
    this.callback = callback ?? function () {};
  }

  // 初始化地图
  init(dom: HTMLElement | null, latitude: number, longitude: number) {
    // 中心点坐标
    const center = new TMap.LatLng(latitude, longitude);
    // 初始化地图
    this.map = new TMap.Map(dom ?? 'map', {
      center,
      zoom: 14, // 缩放比例
      viewMode: '2D', // 显示模式
    });
    // 绑定地图点击事件
    this.map.on('click', this.select.bind(this));

    // 获取缩放控件实例
    const control = this.map.getControl(TMap.constants.DEFAULT_CONTROL_ID.ZOOM);
    // 设置缩放控件位于右下角
    control.setPosition(TMap.constants.CONTROL_POSITION.BOTTOM_RIGHT);

    this.setMaker(center);
  }

  // 点击地图事件
  select(evt: TMap.MapEvent) {
    const { lat, lng } = evt.latLng;
    const address = evt.poi?.name;

    this.callback({ latitude: lat, longitude: lng, address }); // 执行回调

    this.updateMaker(lat, lng); // 更新锚点
  }

  // 设置点标记
  setMaker(loc: TMap.LatLng) {
    this.maker = new TMap.MultiMarker({
      map: this.map,
      styles: {
        // 点标记样式
        marker: new TMap.MarkerStyle({
          width: 20, // 样式宽
          height: 30, // 样式高
          anchor: { x: 10, y: 30 }, // 描点位置
        }),
      },
      geometries: [
        // 点标记数据数组
        {
          // 标记位置(纬度, 经度, 高度)
          position: loc,
          id: 'marker',
        },
      ],
    });
  }

  // 更新标记
  updateMaker(latitude: number, longitude: number) {
    this.maker!.setGeometries([
      {
        position: new TMap.LatLng(latitude, longitude),
        id: 'marker',
      },
    ]);
  }

  // 设置瞄点居中
  setMakerCenter(latitude: number, longitude: number) {
    this.map!.setCenter(new TMap.LatLng(latitude, longitude));
  }
}

