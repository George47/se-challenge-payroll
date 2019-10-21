
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpParameterCodec } from '@angular/common/http';

declare var $: any;

@Injectable()
export class ConnectionService {
	headers: any = false;
	trid: any = -1;

	constructor(
		private client: HttpClient
	) {
		this.headers = new HttpHeaders()
			.append('Content-Type', 'application/json');

	}

	public get(url, query:any={}, custom_headers=null): Observable<any> {
		if (this.trid > 0) {
			return new Observable(observer => {
							this.IEFallback(url, query, 'GET', false).then(data => {
									observer.next(data);
									observer.complete();
							}, error => {
								observer.next(error);
									observer.complete();
							})
					});
		} else {
			let parameters = new HttpParams({encoder: new CustomEncoder()});
			parameters = this.parseParams(parameters, query, []);
			return this.client.get(url, {params: parameters});
		}
	}
	
	public post(url, query:any={}, url_parameters:any={}, is_form_data=false, custom_headers=null): Observable<any> {
		let p = this.toQuery(url_parameters);
		if (p) {
			url += '?' + p;
		}

		if (this.trid > 0) {
			return new Observable(observer => {
				this.IEFallback(url, url_parameters, 'POST', query).then(data => {
						observer.next(data);
						observer.complete();
				}, error => {
					console.log('error post payload', url, query, error);
					observer.next(error);
						observer.complete();
				})
			});
		} else {
			if (is_form_data) {
				let params = new HttpParams({encoder: new CustomEncoder()});
				query = this.parseParams(params, query, []);
			}

			let headers = this.headers;
			if (custom_headers) {
				headers = new HttpHeaders();
				for (let key in custom_headers) {
					headers.append(key, custom_headers[key]);
				}
			}
		
			return this.client.post(url, query, headers);
		}
	}

	private parseParams(params, query, depth) {
		for(let q in query) {
			if (typeof query[q] === 'object') {
				let newDepth = [];
				for(let d = 0; d < depth.length; d++) {
					newDepth.push(depth[d]);
				}
				newDepth.push(q);
				params = this.parseParams(params, query[q], newDepth);
			} else {
				let s = q;
				for(let d = 0; d < depth.length; d++) {
					if (d > 0) {
						s += '['+depth[d]+']';
					} else {
						s = depth[d];
					}

					if (d === depth.length - 1) {
						s += '['+q+']';
					}
				}
				params = params.append(s, query[q]);
			}
		}

		return params;
	}

	private parseQuery(formData: any, query: any, depth: any) {
			for(let q in query) {
					if (typeof query[q] === 'object') {
							depth.push(q);
							formData = this.parseQuery(formData, query[q], depth);
					} else {
							let s = q;
							for(let d = 0; d < depth.length; d++) {
									if (d > 0) {
											s += '['+depth[d]+']';
									} else {
											s = depth[d];
									}

									if (d === depth.length - 1) {
											s += '['+q+']';
									}
							}

							formData.append(s, query[q]);
					}
			}

			return formData;
	}

	private IEFallback(url, data, method, payload) {
			if (!data)
					data = {};

			if (!method)
					method = 'POST';

			let object:any = {
					method: method,
					url: url,
					// async: false,
					data: data
			}
			
			if (payload) {
					object.dataType = 'json';
					object.contentType = "application/json";
					object.data = JSON.stringify(payload);

			}

			let formData = new FormData();
			formData = this.parseQuery(formData, data, []);

			return $.ajax(object);
	}

	public toQuery(query: object) {
		let params = new HttpParams({encoder: new CustomEncoder()});
		params = this.parseParams(params, query, []);
		return params.toString();
	}
}

/**
 * Need a custom encoder for plus signs
 */
class CustomEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}